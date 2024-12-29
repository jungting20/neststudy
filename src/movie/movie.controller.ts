import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  Request,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/auth/decorater/public.decorator';
import { RBAC } from 'src/auth/decorater/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Public()
  @Get()
  findAll(@Request() req: any, @Query() dto?: GetMoviesDto) {
    return this.movieService.findAll(dto);
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.movieService.findOne(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.admin)
  create(@Body() createMovieDto: CreateMovieDto, @Request() req) {
    // console.log('[movie.controller.ts]-line:83-word:file', movie);
    return this.movieService.create(createMovieDto, req.queryRunner);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.movieService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }
}
