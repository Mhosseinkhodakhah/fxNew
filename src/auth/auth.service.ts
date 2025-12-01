import { Inject, Injectable, Req, Res } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { sendOtpDto } from './dto/sendOtpDto.dto';
import { RedisServiceService } from 'src/redis-service/redis-service.service';
import { UserService } from 'src/user/user.service';
import { TokenizeService } from 'src/tokenize/tokenize.service';
import { json } from 'stream/consumers';
import { validateOtpDto } from './dto/validateOtpDto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/entities/user.entity';
import { refreshTokenDto } from './dto/refreshTokenDto.dto';
import * as bcrypt from 'bcrypt';
import { SmsService } from 'src/utils/sms';

@Injectable()
export class AuthService {
  constructor(
    private redisService: RedisServiceService,
    private userServiceL: UserService,
    private tokenize: TokenizeService,
    @InjectModel('userM') private userModel: Model<UserDocument>,
  ) {}

  private async otpGenerator() {
    return Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  }

  async sendOtp(@Req() req: any, @Res() res: any, body: sendOtpDto) {
    try {
      const { phoneNumber } = body;
      const otp = await this.otpGenerator();
      const data = { otp: otp, date: new Date().getTime() };

      let cache = await this.redisService.get(`otp:::lock:::${phoneNumber}`)
      if (cache){
        return {
          message : 'کاربر گرامی تعداد درخواست شما بیش از حد مجاز می باشد.',
          statusCode : 403,
          error : 'کاربر گرامی تعداد درخواست شما بیش از حد مجاز می باشد'
        }
      }

      const test = await this.redisService.setOtp(
        `otp-${phoneNumber}`,
        JSON.stringify(data),
      );

      console.log(test, 'test is here');

      await this.redisService.lockOtp(phoneNumber)
      console.log('ip issss>>>>' , req.headers['x-forwarded-for'])
      // await this.redisService.lockOtp(req.ip)

      const smsService = new SmsService();
      const smsResponse: any =  smsService.sendOtpMessage(
        phoneNumber,
        otp.toString(),
      );

      // if (!smsResponse.success) {
      //   return {
      //     message: smsResponse.msg || 'ارسال کد تایید ناموفق',
      //     statusCode: 500,
      //   };
      // }

      return {
        message: 'ارسال کد تایید موفق',
        statusCode: 200,
        data: null,
      };
    } catch (error) {
      console.log('error in sending otp:', error);
      return {
        message: 'ارسال کد تایید ناموفق',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }


  /**
   * this endpoint is for approving otp code and login users
   * @param body 
   * @returns 
   */
  async validateOtp(body: validateOtpDto) {
    try {

      const otp = body.otp;

      const phoneNumber = body.phoneNumber;

      let findedOtp = await this.redisService.get(`otp-${body.phoneNumber}`);

      console.log(findedOtp, '///// findotp');

      findedOtp = JSON.parse(findedOtp);
      const date = new Date().getTime();
      if (!findedOtp) {
        return {
          message: 'شماره تلفن پیدا نشد',
          statusCode: 400,
          error: 'شماره تلفن پیدا نشد',
        };
      }
      console.log('date', date - findedOtp.date);

      if (date - findedOtp.date > 120000) {
        return {
          message: 'کد ورود منقضی شده است',
          statusCode: 400,
          error: 'کد ورود منقضی شده است',
        };
      }
      if (otp != findedOtp.otp) {
        return {
          message: 'کد ورود اشتباه است',
          statusCode: 400,
          error: 'کد ورود اشتباه است',
        };
      }

      const user = await this.userServiceL.checkOrCreate(phoneNumber);
      // const user = await this.userModel.create({
      //   phoneNumber: phoneNumber,
      //   authStatus: 1,
      //   identityStatus: 2,
      // });
      console.log('userrrrr', user);
      if (!user) {
        return {
          message: 'لطفا دوباره امتحان کنید',
          statusCode: 400,
          error: 'لطفا دوباره امتحان کنید',
        };
      }
      
      const token = await this.tokenize.tokenize(
        {
          _id: user?._id,
          phoneNumber: user?.phoneNumber,
          role: 'user',
          firstName: user?.firstName,
          lastName: user?.lastName,
          nationalCode : user?.nationalCode
        },
        '10H',
        0,
      );
      const refreshToken = await this.tokenize.tokenize(
        {
          _id: user?._id,
          phoneNumber: user?.phoneNumber,
          role: 'user',
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
        '10h',
        1,
      );
      let deleteRedisOtp = await this.redisService.reset(`otp-${body.phoneNumber}`);
      
      console.log('deleted redis key' , deleteRedisOtp)
      return {
        message: 'با موفقیت وارد شدید',
        statusCode: 200,
        data: { refreshToken: refreshToken, token: token, ...user?.toObject() },
      };
    } catch (error) {
      console.log('error is sending otp', error);
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }

  async refreshToken(refreshToken: refreshTokenDto) {
    try {

      console.log('its come for refresh token')
      const decoded = await this.tokenize.checkRefreshToken(
        refreshToken.refreshToken,
      );

      
      
      if (!decoded) {
        return {
          message: ' توکن منقضی شده است',
          statusCode: 401,
          error: ' توکن منقضی شده است',
        };
      }

      console.log('its come for refresh token' , decoded)
      
      const token = await this.tokenize.tokenize(
        { _id: decoded?._id, phoneNumber: decoded?.phoneNumber, role: 'user' },
        '10H',
        0,
      );

      let refreshToken2 = await this.tokenize.tokenize(
        { _id: decoded?._id, phoneNumber: decoded?.phoneNumber, role: 'user' },
        '3H',1
      )

      console.log('its come for refresh token' , token)
      
      return {
        message: 'ارسال کد تایید موفق',
        statusCode: 200,
        data: { token , refreshToken :refreshToken2 }
      };
    } catch (error) {
      console.log('error is sending otp', error);
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }

  async sendSetPasswordOtp(userId: string) {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر  پیدا نشد',
        };
      }

      let otp = await this.otpGenerator();
      let data = { otp: otp, date: new Date().getTime() };

      await this.redisService.setOtp(
        `otp-pass-${user.phoneNumber}`,
        JSON.stringify(data),
      );

      return {
        message: 'ارسال کد تایید موفق',
        statusCode: 200,
        data: otp,
      };
    } catch (error) {
      console.log('error is sending otp', error);
      return {
        message: 'ارسال کد تایید ناموفق',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }

  async setpassword(userId: string, otp: number, password: string) {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر  پیدا نشد',
        };
      }

      let findedOtp = await this.redisService.get(
        `otp-pass-${user.phoneNumber}`,
      );

      findedOtp = JSON.parse(findedOtp);
      console.log(findedOtp);
      const date = new Date().getTime();
      if (!findedOtp) {
        return {
          message: 'شماره تلفن پیدا نشد',
          statusCode: 400,
          error: 'شماره تلفن پیدا نشد',
        };
      }
      console.log('date', date - findedOtp.date);

      if (date - findedOtp.date > 120000) {
        return {
          message: 'کد ورود منقضی شده است',
          statusCode: 400,
          error: 'کد ورود منقضی شده است',
        };
      }
      if (otp != findedOtp.otp) {
        return {
          message: 'کد ورود اشتباه است',
          statusCode: 400,
          error: 'کد ورود اشتباه است',
        };
      }

      const hashedPassword = await this.hashPassword(password);
      user.password = hashedPassword;
      await user.save();

      return {
        message: 'رمز عبور با موفقیت تغییر پیدا کرد',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.log('error', error);

      return {
        message: 'ارسال کد تایید ناموفق',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }

  async loginWithPassword(phoneNumber: string, password: string) {
    try {
      const user = await this.userModel.findOne({ phoneNumber: phoneNumber });
      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر  پیدا نشد',
        };
      }

      const isMatch = this.comparePasswords(password, user.password);

      if (!isMatch) {
        return {
          message: 'رمز با شماره تلفن همخوانی ندارد',
          statusCode: 400,
          error: 'رمز با شماره تلفن همخوانی ندارد',
        };
      }
      const token = await this.tokenize.tokenize(
        { _id: user?._id, phoneNumber: user?.phoneNumber, role: 'user' },
        '1m',
        0,
      );
      const refreshToken = await this.tokenize.tokenize(
        { _id: user?._id, phoneNumber: user?.phoneNumber, role: 'user' },
        '1m',
        1,
      );
      return {
        message: 'ارسال کد تایید موفق',
        statusCode: 200,
        data: { refreshToken: refreshToken, token: token, ...user?.toObject() },
      };
    } catch (error) {
      console.log('error', error);

      return {
        message: 'ارسال کد تایید ناموفق',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }

  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
