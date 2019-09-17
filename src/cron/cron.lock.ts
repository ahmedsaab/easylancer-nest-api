import { ILocker, IScheduleConfig } from 'nest-schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyLocker implements ILocker {
  private key: string;
  private config: IScheduleConfig;

  init(key: string, config: IScheduleConfig): void {
    this.key = key;
    this.config = config;
    console.log('init my locker: ', key, config);
  }

  release(): any {
    console.log('release my locker');
  }

  tryLock(): Promise<boolean> | boolean {
    console.log('apply my locker');
    return true;
  }
}
