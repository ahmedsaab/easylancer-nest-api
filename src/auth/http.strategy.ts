import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(id: string) {
    try {
      return await this.authService.validateUser(id);
    } catch (e) {
      throw new UnauthorizedException(`Unauthorized, non-existent, or invalid user id: ${id}`);
    }
  }
}
