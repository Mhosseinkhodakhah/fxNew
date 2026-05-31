// user-service/src/modules/users/users.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from 'src/common/types/enum';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class UsersService {

  constructor(
      @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreate(email: string) {
    // ۱. بررسی اینکه آیا کاربری با این ایمیل وجود دارد یا خیر
    // relations را می‌آوریم تا اطلاعات پروفایل و تنظیمات هم همراهش لود شود
    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'settings'],
    });

    // ۲. اگر کاربر وجود داشت، همان را برمی‌گردانیم
    if (user) {
      this.logger.log(`User found with email: ${email}`);
      return {
        message : 'done',
        statusCode:200,
        data : user
      }
    }

    // ۳. اگر کاربر وجود نداشت، یک کاربر جدید می‌سازیم
    this.logger.log(`Creating new user with email: ${email}`);

    user = this.userRepository.create({
      email,
      isVerify: true,
      // چون در فایل user.entity.ts برای profile و settings مقدار cascade: true قرار دادید،
      // با پاس دادن آبجکت خالی {} تایپ‌اوآرام خودش رکوردهای مربوطه را در جداول Profile و Settings می‌سازد.
      profile: {},
      settings: {},
    });

    // ذخیره کاربر جدید در دیتابیس (رکوردهای پروفایل و ستینگز هم خودکار ساخته می‌شوند)
    await this.userRepository.save(user);

    return {
        message : 'done',
        statusCode:200,
        data : user
      }
  }

  async updateUserInfo(userId: string, updateData: DeepPartial<User>) {
    // ۱. پیدا کردن کاربر به همراه رلوشن‌ها برای آپدیت یکپارچه
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'settings'],
    });

    if (!user) {
      return {
        statusCode : 400,
        success: false,
        message: 'User not found',
      };
    }

    user.isUpdated = true;
    // ۲. ترکیب اطلاعات جدید با اطلاعات فعلی کاربر
    // متد merge مقادیر undefined را نادیده می‌گیرد و فقط فیلدهای ارسال شده را آپدیت می‌کند
    this.userRepository.merge(user, updateData);

    // ۳. ذخیره در دیتابیس
    try {
      const updatedUser = await this.userRepository.save(user);

      this.logger.log(`User with ID ${userId} updated successfully`);

      return {
        statusCode : 200,
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error(`Error updating user ${userId}:`, error);
      return {
        success: false,
        statusCode : 500,
        message: 'Failed to update user',
      };
    }
  }

  
  async getUserInfo(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'followersCount',
          'followingCount',
          'role',
          'phone',
          'isSuspend',
          'isUpdated',
          'isVerify',
          'createdAt',
          'location',
        ],
        relations: ['profile'],
      });

      if (!user) {
        return {
          statusCode : 400,
          success: false,
          message: 'User not found',
        };
      }

      return {
        statusCode : 200,
        success: true,
        message: 'User founded',
        data: user,
      };
    } catch (error: any) {
      return {
        statusCode : 500,
        success: false,
        message: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getAllUsers() {
    try {
      const users = await this.userRepository.find({
        skip: 0,
        take: 50,
        relations: { profile: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerify: true,
          isSuspend: true,
          role: true,
          phone: true,
          profile: {
            id: true,
            avatar: true,
          },
        },
      });

      return {
        statusCode : 200,
        success: true,
        data: users,
        message: 'Users found!',
      };
    } catch (error: any) {
      return {
        statusCode:500,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async suspendUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, statusCode : 400 ,message: 'User not found' };
      }

      if (user?.isSuspend) {
        await this.userRepository.update(userId, { isSuspend: false });
        return {
          statusCode : 200,
          success: true,
          message: 'User not suspend',
        };
      } else {
        await this.userRepository.update(userId, { isSuspend: true });
        return {
          statusCode : 200,
          success: true,
          message: 'User is suspend',
        };
      }
    } catch (error: any) {
      return {
        statusCode : 500,
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async changeRole(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user?.role === UserRole.USER) {
        await this.userRepository.update(userId, { role: UserRole.TRADER });
        return {
          success: true,
          message: 'The user role was changed to Trader.',
        };
      } else {
        await this.userRepository.update(userId, { role: UserRole.USER });
        return {
          success: true,
          message: 'The user role was changed to User.',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
