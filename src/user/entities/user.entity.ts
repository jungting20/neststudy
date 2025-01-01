import { Exclude } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base.entity';
import { MovieUserLike } from 'src/movie/entities/movie-user-like.entity';
import { Movie } from 'src/movie/entities/movie.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true, //요청 받을 땜
  })
  password: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;

  @OneToMany(() => Movie, (movie) => movie.creator)
  createMovies: Movie[];

  @OneToMany(() => MovieUserLike, (movieUserLike) => movieUserLike.user)
  likedMovies: MovieUserLike[];
}
