import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { logger } from './common/middlewares/logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mongodb',
    synchronize: true,
    host: 'localhost',
    port: 27017,
    username: 'dbadmin',
    password: 'easylancer88',
    database: 'core-db',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
  }), TasksModule, UsersModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const excludedRouts = [
      { path: 'cats', method: RequestMethod.GET },
      { path: 'cats', method: RequestMethod.POST },
    ];
    consumer
      .apply(logger)
      .exclude(...excludedRouts)
      .forRoutes(UsersController);
  }
}
