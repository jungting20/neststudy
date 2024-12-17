import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

type OrderLike = `${string}_ASC` | `${string}_DESC`;

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  // @IsIn(['ASC', 'DESC'])
  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  order: OrderLike[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  take: number = 5;
}
