import { Exclude } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}