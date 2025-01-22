import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entities/movie-user-like.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,

    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,

    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,

    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(
    createMovieDto: CreateMovieDto,
    userId: number,
    qr: QueryRunner,
  ) {
    // const qr = this.dataSource.createQueryRunner();
    // await qr.connect();
    // await qr.startTransaction();
    // try {
    const director = await qr.manager.findOne(Director, {
      where: { id: createMovieDto.directorId },
    });

    if (!director) {
      throw new NotFoundException('감독이 없음');
    }

    const genres = await qr.manager.findByIds(Genre, createMovieDto.genreIds);

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException('존재하지않느 장르가 포함됨');
    }

    const movieDetail = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail,
      })
      .execute();

    const moviewDetailId = movieDetail.identifiers[0].id;

    // const publicFolder = join(process.cwd(), 'public');

    const tempFolder = join('public', 'temp', createMovieDto.movieFileName);
    const movieFolder = join('public', 'movie', createMovieDto.movieFileName);

    const movie = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: {
          id: moviewDetailId,
        },
        director,
        creator: {
          id: userId,
        },
        movieFilePath: movieFolder,
      })
      .execute();

    await qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movie.identifiers[0].id)
      .add(genres.map((genre) => ({ id: genre.id })));

    await rename(
      join(process.cwd(), tempFolder),
      join(process.cwd(), movieFolder),
    );

    // await qr.commitTransaction();

    const resMovie = await qr.manager.findOne(Movie, {
      where: { id: movie.identifiers[0].id },
      relations: ['detail', 'director', 'genres'],
    });

    return resMovie;
    // } catch (error) {
    //   await qr.rollbackTransaction();
    //   throw error;
    // } finally {
    //   await qr.release();
    // }
  }

  async findRecent() {
    // await this.cacheManager.set('number', 10);

    const cacheData = await this.cacheManager.get<number>('MOVIE_RECENT');

    if (cacheData) {
      return cacheData;
    }

    const data = await this.movieRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    await this.cacheManager.set('MOVIE_RECENT', data, 3000);

    return this.movieRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });
  }

  async findAll(dto: GetMoviesDto, userId: number) {
    const { title } = dto;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    const { count, data, nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    if (userId) {
      const movieIds = data.map((movie) => movie.id);

      const likedMovies =
        movieIds.length < 1
          ? []
          : await this.movieUserLikeRepository
              .createQueryBuilder('mul')
              .leftJoinAndSelect('mul.user', 'user')
              .leftJoinAndSelect('mul.movie', 'movie')
              .where('movie.id IN (:...movieIds)', { movieIds })
              .andWhere('user.id = :userId', { userId })
              .getMany();

      const likedMovieMap = likedMovies.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.movie.id]: cur.isLike,
        };
      }, {});

      const newData = data.map((movie) => {
        return {
          ...movie,
          likeStatus:
            movie.id in likedMovieMap ? likedMovieMap[movie.id] : null,
        };
      });

      return {
        data: newData,
        count,
        nextCursor,
      };
    }

    return {
      data,
      count,
      nextCursor,
    };
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) {
      return new NotFoundException('없음');
    }
    return movie;
    // return this.mov
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail'],
      });

      if (!movie) {
        return new NotFoundException('영화가 없음');
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: { id: directorId },
        });

        if (!director) {
          throw new NotFoundException('감독이 없음');
        }

        newDirector = director;
      }

      let newGenres;

      if (genreIds) {
        newGenres = await qr.manager.findByIds(Genre, genreIds);
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      await qr.manager
        .createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where({ id })
        .execute();

      // await this.movieRepository.update({ id }, movieUpdateFields);

      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({ detail })
          .where({ id: movie.detail.id })
          .execute();
      }

      const newMovie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });

      newMovie.genres = newGenres;

      await qr.manager.save(Movie, newMovie);
      await qr.commitTransaction();

      return this.movieRepository.preload(newMovie);
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      return new NotFoundException('없음');
    }

    await this.movieRepository.delete({ id });
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });

    if (!movie) {
      return new BadRequestException('영화가 없음');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return new UnauthorizedException('사용자가 없음');
    }

    // console.log('[movie.service.ts]-line:269-word:', 'user');

    // console.log('[movie.service.ts]-line:270-word:likeRecord', likeRecord);

    const likeRecord = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update(
          {
            movie,
            user,
          },
          {
            isLike,
          },
        );
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike: isLike,
      });
    }

    const result = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return {
      isLike: result && result.isLike,
    };
  }
}
