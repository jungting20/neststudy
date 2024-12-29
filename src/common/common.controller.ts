import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 1024 * 1024 * 20,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'video/mp4') {
          return cb(
            new BadRequestException('MP$ 타입만 업로드 가능합니다'),
            false,
          );
        }

        return cb(null, true);
      },
    }),
  )
  createVideo(@UploadedFile() video: Express.Multer.File) {
    return {
      fileName: video.filename,
    };
  }
}
