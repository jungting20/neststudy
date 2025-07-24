import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';

@Injectable()
export class TasksService {
  constructor() {}

  // @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));

    const deleteFilesTargets = files.filter((file) => {
      const filename = parse(file).name;
      const split = filename.split('_');

      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = 1000 * 60 * 60 * 24;
        const now = +new Date();
        return now - date > aDayInMilSec;
      } catch (e) {
        return true;
      }
    });

    await Promise.all(
      deleteFilesTargets.map((file) => {
        return unlink(join(process.cwd(), 'public', 'temp', file));
      }),
    );

    // console.log('[tasks.common.ts]-line:34-word:', deleteFilesTargets);
  }
}
