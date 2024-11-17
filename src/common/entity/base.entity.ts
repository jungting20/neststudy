import { Exclude } from 'class-transformer';
import { CreateDateColumn, VersionColumn } from 'typeorm';

export class BaseTable {
  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @CreateDateColumn()
  @Exclude()
  updatedAt: Date;

  @VersionColumn()
  @Exclude()
  version: number;
}
