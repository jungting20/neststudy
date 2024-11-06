import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from './base.entity';
import { MovieDetail } from './movie-detail.entity';

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => {
    return MovieDetail;
  })
  @JoinColumn()
  detail: MovieDetail;
}
