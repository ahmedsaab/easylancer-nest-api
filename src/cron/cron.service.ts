import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule, UseLocker } from 'nest-schedule';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { MyLocker } from './cron.lock';

@Injectable()
export class ScheduleService extends NestSchedule {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  @Cron('* * * * *')
  @UseLocker(MyLocker)
  async progressAssignedTasks() {
    const tasks = await this.tasksService.findAll();
    console.log(tasks);
  }
}
