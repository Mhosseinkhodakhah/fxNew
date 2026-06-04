// api-gateway/src/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types/interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    // private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const cookies = request.cookies as Record<string, string>;
    const token = cookies?.['sh_auth_'];

    if (!token) {
      throw new UnauthorizedException('Please log in to your account.');
    }

    try {
      // اعتبارسنجی توکن
      // اگر توکن منقضی شده باشد یا دستکاری شده باشد، خطا می‌دهد
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // اضافه کردن اطلاعات کاربر به آبجکت request برای استفاده در کنترلرها
      // payload شامل همان sub (یا id) و email است که در Auth Service ست کردید
      request.user = payload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException(`Unauthorized Error: ${error.message}`);
      }
      throw new UnauthorizedException('Token not valid or expired!');
    }

    return true;
  }
}
