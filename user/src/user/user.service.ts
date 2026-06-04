// user-service/src/modules/users/users.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import { UserRole } from 'src/common/types/enum';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { JwtService } from '@nestjs/jwt';
import { MagicLink } from './entities/magic-link.entity';



@Injectable()
export class UsersService {

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MagicLink)
    private readonly magicLinkRepo: Repository<MagicLink>,
    private jwtService : JwtService
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



  async processMagicLinkRequest(email: string) {
    // ۱. تولید توکن امن و رندوم (۳۲ بایت)
    const token = crypto.randomBytes(32).toString('hex');

    // ۲. تنظیم زمان انقضا (مثلا ۱۵ دقیقه دیگر)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // ۳. ذخیره در دیتابیس
    const magicLink = this.magicLinkRepo.create({
      email,
      token,
      expiresAt,
    });
    await this.magicLinkRepo.save(magicLink);

    // ۴. ساخت لینک کامل مجیک لینک
    const frontendUrl = 'https://fxweb.sunbit.ir';
    const fullMagicLink = `${frontendUrl}/verify?token=${token}`;

    // // ۵. ارسال رویداد (Event) به کافکا برای سرویس ایمیل
    // this.kafkaClient.emit(TOPICS.EMAIL.SEND_MAGIC_LINK, {
    //   email,
    //   token,
    //   link: fullMagicLink,
    // });

    // ۶. بازگرداندن لینک به Gateway
    return {
      success: true,
      message: 'We have sent a link to your email , Please check it.',
      link: fullMagicLink,
    };
  }






  /**
   * its for verifying magic link
   * @param token 
   * @returns 
   */
  async verifyMagicLink(token: string) {
    // پیدا کردن توکن در دیتابیس
    const magicLink = await this.magicLinkRepo.findOne({
      where: { token },
    });

    // ۱. بررسی وجود توکن
    if (!magicLink) {
      return {
        statusCode: 400,
        message: 'Invalid link.',
      };
    }

    // ۲. بررسی استفاده نشدن قبلی توکن
    if (magicLink.isUsed) {
      return {
        statusCode: 400,
        message: 'Link has already been used.',
      };
    }

    // ۳. بررسی انقضای زمانی توکن
    if (magicLink.expiresAt < new Date()) {
      return {
        statusCode: 400,
        message: 'Link has expired. Please request a new one.',
      }
    }

    // ۴. علامت‌گذاری توکن به عنوان "استفاده شده"
    magicLink.isUsed = true;
    await this.magicLinkRepo.save(magicLink);

    // ۵. 👈 ارتباط با سرویس یوزر برای پیدا کردن یا ساختن کاربر
    try {
      

       let user = this.userRepository.create({
        email : magicLink.email
      })

      await this.userRepository.save(user)

      const payload = { id: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      // برگرداندن پاسخ موفقیت آمیز به همراه اطلاعات کاربر
      return {
        success: true,
        message: 'Email verified successfully',
        user: {
          avatar: user?.profile?.avatar,
          email: user.email,
          isVerify: user?.isVerify,
          role: user?.role,
          firstName: user?.firstName,
        },
        accessToken, // 👈 دیتای کاربر از سرویس یوزر می‌آید
      };
    } catch (error) {
      console.error('Error communicating with User service:', error);
      return {
        statusCode: 500,
        message: 'Could not fetch or create user profile.',
      }
    }
  }
}
