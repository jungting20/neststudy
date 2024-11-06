import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { MovieDetail } from './entities/movie-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieDetail])],
  controllers: [MovieController],
  providers: [MovieService],
  // entities: [],
})
export class MovieModule {}
