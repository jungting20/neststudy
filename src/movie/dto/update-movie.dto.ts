import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  // @IsNotEmpty()
  // @IsOptional()
  // title?: string;
  //
  // @IsNotEmpty()
  // @IsOptional() @IsString()
  // detail?: string;
  //
  // @IsNotEmpty()
  // @IsOptional()
  // @IsNumber()
  // directorId?: number;
  //
  // @IsOptional()
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsNumber({}, { each: true })
  // genreIds: number[];
}
