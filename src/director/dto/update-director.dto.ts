import { CreateDirectorDto } from './create-director.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDirectorDto extends PartialType(CreateDirectorDto) {}
