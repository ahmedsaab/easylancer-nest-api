import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(id: string): Promise<any> {
    // Validate if id passed along with HTTP request
    // is associated with any registered account in the database
    if (!Types.ObjectId.isValid(id)) {
      throw Error(`Invalid userId: ${id}`);
    }
    // TODO: make sure that the client API is sure that user exists
    // await this.usersService.exists(id);
    return {
      id,
    };
  }
}
