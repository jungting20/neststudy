import { Injectable } from '@nestjs/common';

export interface Movie {
  id: number;
  title: string;
}

@Injectable()
export class AppService {
  getManyMovies(): Movie[] {
    return [
      {
        id: 1,
        title: 'The Shawshank Redemption',
      },

      {
        id: 2,
        title: 'The Shawshank Redemption',
      },
    ];
  }
}
