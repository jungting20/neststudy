import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { User } from 'src/user/entities/user.entity';

// @Entity();
@Entity()
export class MovieUserLike {
  @PrimaryGeneratedColumn({
    name: 'movieId',
    type: 'int8',
  })
  @ManyToOne(() => Movie, (movie) => movie.likedUsers)
  movie: Movie;

  @PrimaryGeneratedColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedMovies)
  user: User;
}
