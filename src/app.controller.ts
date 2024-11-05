import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMovies() {
    return this.appService.getManyMovies();
  }

  @Get()
  getMovie() {
    return {
      id: 1,
      title: 'The Shawshank Redemption',
      year: 1994,
      runtime: 142,
      actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
    };
  }
}
