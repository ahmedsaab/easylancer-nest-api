import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseFilters,
  UsePipes,
  ValidationPipe,
  UseGuards,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
// import { User } from './interfaces/user.interface';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
// import { JoiValidationPipe } from '../common/pipes/joi-validation.pip';
// import { ValidationPipe } from '../common/pipes/validation.pipe';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { HttpValidationExceptionFilter } from '../common/filters/http-validation-exception.filter';
import { RolesGuard } from '../common/gaurds/roles.gaurd';
import { Roles } from '../common/decorators/roles.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { User } from './user.entity';

// @UseFilters(HttpExceptionFilter)
@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseFilters(HttpValidationExceptionFilter)
  @Roles('admin')
  @UsePipes(new ValidationPipe({
    transform: true,
    skipMissingProperties: true,
  }))
  // @SetMetadata('roles', ['admin'])
  // @UsePipes(new JoiValidationPipe(createUserSchema))
  async create(@Body() createUserDto: CreateUserDto) {
    // return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return `This action returns a #${id} user`;
  }

  @Put(':id')
  // @UsePipes(ValidationPipe)
  @UsePipes(new ValidationPipe({
    transform: true,
    skipMissingProperties: true,
  }))
  update(@Param('id', new ParseIntPipe()) id: number, @Body() updateUserDto: UpdateUserDto) {
    // return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return `This action removes a #${id} user`;
  }
}
