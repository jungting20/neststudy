import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movie = await this.movieRepository.save(createMovieDto);

    await this.movieRepository.findOne({
      where: { id: movie.id },
    });
  }

  findAll(title?: string) {
    return this.movieRepository.find();
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      return new NotFoundException('없음');
    }
    return movie;
    // return this.mov
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      return new NotFoundException('없음');
    }

    await this.movieRepository.update({ id }, updateMovieDto);

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
