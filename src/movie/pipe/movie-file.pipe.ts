import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { join } from 'path';
import { v4 } from 'uuid';
import { rename } from 'fs/promises';

@Injectable()
export class MovieFilePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  constructor(
    private readonly options: {
      maxSize: number;
      mimetype: string;
    },
  ) {}
  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 필드는 필수입니다!');
    }

    const byteSIze = this.options.maxSize * 1024 * 1024;
    if (value.size > byteSIze) {
      throw new BadRequestException(
        `${this.options.maxSize}MB 이하의 사이즈만 업로드 가능합니다!.`,
      );
    }

    if (this.options.mimetype !== 'video/mp4') {
      throw new BadRequestException(
        `${this.options.mimetype} 타입만 업로드 가능합니다`,
      );
    }

    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }

    const filename = `${v4()}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename);

    await rename(value.path, newPath);

    return {
      ...value,
      filename,
      path: newPath,
    };
  }
}
