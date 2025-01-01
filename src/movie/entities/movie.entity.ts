import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { BaseTable } from './base.entity';
import { MovieDetail } from './movie-detail.entity';
import { BaseTable } from 'src/common/entity/base.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { Transform } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './movie-user-like.entity';

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @ManyToOne(() => User, (user) => user.createMovies)
  creator: User;

  @OneToOne(
    () => {
      return MovieDetail;
    },
    (movieDetail) => {
      return movieDetail.id;
    },
    {
      cascade: true,
      nullable: false,
    },
  )
  @JoinColumn()
  detail: MovieDetail;

  @Column()
  @Transform(({ value }) => {
    return `http://localhost:3000/${value}`;
  })
  movieFilePath: string;

  @Column({
    default: 0,
  })
  likeCount: number;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;

  @ManyToMany(() => Genre, (genre) => genre.movies, {
    cascade: true,
  })
  @JoinTable()
  genres: Genre[];

  @OneToMany(() => MovieUserLike, (movieUserLike) => movieUserLike.movie)
  likedUsers: MovieUserLike[];
}
