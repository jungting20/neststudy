import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      return value;
    }

    if (value.length <= 2) {
      throw new BadRequestException('영화의 제목은 세자 이상 작성해 주세요.');
    }
    return value;
  }
}
