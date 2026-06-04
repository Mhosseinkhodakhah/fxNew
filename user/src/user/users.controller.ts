import { Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DeepPartial } from 'typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './user.service';
import { TOPICS } from 'src/common/constants';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthAdminGuard } from 'src/auth-admin/auth-admin.guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get-user')
  @UseGuards(AuthGuard)
  async getUserInfo(@Req() req : any) {
    return await this.usersService.getUserInfo(req.user._id);
  }

  @Post('update-user')
  @UseGuards(AuthGuard)
    async updateUserInfo(
    @Payload() message: { userId: string; userData: DeepPartial<User> },
  ) {
    return await this.usersService.updateUserInfo(
      message.userId,
      message.userData,
    );
  }

  @Get('all-users')
  @UseGuards(AuthAdminGuard)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Put('suspend/:id')
  @UseGuards(AuthAdminGuard)
  async suspendUser(@Payload() message: { id: string }) {
    return await this.usersService.suspendUser(message.id);
  }
  
  @Put('change-role/:id')
  @UseGuards(AuthAdminGuard)
  async changeRole(@Payload() message: { id: string }) {
    return await this.usersService.changeRole(message.id);
  }


  @Post('magic-link')
  async handleMagicLink(@Payload() data: { email: string }) {
    try {
      // فراخوانی متد اصلی از سرویس
      return await this.usersService.processMagicLinkRequest(data.email);
    } catch (error) {
      console.error('Error in Auth Service:', error);
      throw error;
    }
  }

  @Post('verify-magic-link')
  async verifyMagicLink(@Payload() payload: { token: string }) {
    try {
      return await this.usersService.verifyMagicLink(payload.token);
    } catch (error) {
      console.error('Error in Auth Service:', error);
      throw error;
    }
  }

}
