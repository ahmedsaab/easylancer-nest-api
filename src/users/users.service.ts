import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const user = new User();
    user.id = 123;
    user.name = 'alex';
    await this.userRepository.save(user);
    return await this.userRepository.find();
  }
}

// import { HttpException, HttpStatus, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// import { User } from './interfaces/user.interface';
//
// @Injectable()
// export class UsersService {
//   private readonly users: User[] = [];
//
//   create(user: User) {
//     this.users.push(user);
//     return user;
//   }
//
//   findAll(): User[] {
//     return this.users;
//   }
//
//   update(id: number, user: User) {
//     const index = this.users.findIndex((element) => element.id === id);
//     if (index !== -1) {
//       this.users[index] = {
//         ...this.users[index],
//         ...user,
//       };
//       return this.users[index];
//     } else {
//      throw new NotFoundException(`use doesn't exits`);
//     }
//   }
// }
