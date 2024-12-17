import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;

    const skip = (page - 1) * take;
    qb.skip(skip).take(take);
  }

  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, take, order } = dto;

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');

      /** 
* {
  "values": {
    "id": 1
  },
  "order": [
    "id_DESC"
  ]}
*/
      const cursorObj = JSON.parse(decodedCursor);

      order = cursorObj.order;

      const { values } = cursorObj;

      const columns = Object.keys(values);

      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';

      const whereConditions = columns
        .map((c) => {
          return `${qb.alias}.${c}`;
        })
        .join(',');

      const whereParams = columns
        .map((c) => {
          return `:${c}`;
        })
        .join(',');

      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`, //
        values,
      );
    }

    order.forEach((order, index) => {
      const [column, direction] = order.split('_');

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException('Order는 ASC 또는 DESC로 입력해주세요.');
      }
      if (index === 0) {
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
      // qb.addOrderBy(`${qb.alias}.${o}`, 'ASC');
    });

    // qb.orderBy(`${qb.alias}.id`, order);

    qb.take(take);

    const [data, count] = await qb.getManyAndCount();

    const nextCursor = this.generateNextCursor(data, order);

    return { qb, nextCursor, count, data };
  }

  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) {
      return null;
    }

    const lastItem = results[results.length - 1];

    const values = {};

    order.forEach((o) => {
      const [column] = o.split('_');
      values[column] = lastItem[column];
    });

    const cursorObj = { values, order };

    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );

    return nextCursor;
    // return cursor;
  }
}
