import { CreateDateColumn, VersionColumn } from 'typeorm';

export class BaseTable {
  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
