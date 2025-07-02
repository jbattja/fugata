import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() data: CreateUserDto
  ): Promise<User> {
    return this.userService.create(
      data.username,
      data.email,
      data.password,
      data.role,
      data.merchantIds
    );
  }

  @Get()
  async findAllUsers(@Query() filters: GetUsersDto): Promise<User[]> {
    return this.userService.findAll(filters);
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string): Promise<User | null> {
    return this.userService.findByUsername(username);
  }

  @Post('validate-password')
  async validatePassword(
    @Body() data: { username: string; password: string }
  ): Promise<boolean> {
    const user = await this.userService.findByUsername(data.username);
    if (!user) {
      return false;
    }
    return this.userService.validatePassword(user, data.password);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<User> & { password?: string }
  ): Promise<User | null> {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
} 