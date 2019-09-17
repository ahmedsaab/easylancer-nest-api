import { Module } from '@nestjs/common';
import { ScheduleService } from './cron.service';
import { OffersModule } from '../offers/offers.module';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    OffersModule,
    UsersModule,
    TasksModule,
  ],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class CronModule {}
