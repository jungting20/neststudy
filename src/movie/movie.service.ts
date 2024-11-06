import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { MovieDetail } from './entities/movie-detail.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movieDetail = await this.movieDetailRepository.save({
      detail: createMovieDto.detail,
    });

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: movieDetail,
    });

    return movie;
  }

  findAll(title?: string) {
    return this.movieRepository.find();
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      return new NotFoundException('없음');
    }
    return movie;
    // return this.mov
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      return new NotFoundException('없음');
    }

    const { detail, ...movieRest } = updateMovieDto;

    if (detail) {
      await this.movieDetailRepository.update(
        { id: movie.detail.id },
        { detail },
      );
    }

    await this.movieRepository.update({ id }, movieRest);

    const newMovie = await this.movieRepository.findOne({ where: { id } });

    return newMovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      return new NotFoundException('없음');
    }

    await this.movieRepository.delete({ id });
  }
}
