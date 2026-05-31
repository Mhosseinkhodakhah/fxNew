import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { sendOtpDto } from './dto/sendOtpDto.dto';
import { validateOtpDto } from './dto/validateOtpDto.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { refreshTokenDto } from './dto/refreshTokenDto.dto';
import { loginWithPasswordDto } from './dto/loginWithPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/otp')
  @ApiOperation({ summary: 'sending otp code' })
  @ApiResponse({
    status: 200,
    description: 'the otp code sent successfully',
    schema: {
      example: {
        success: true,
        message: 'کد تایید موفق',
        error: null,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this code already sendt',
        error: 'duplicate sent code',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: sendOtpDto,
    description: 'Json structure for project object',
  })
  sendOtp(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: sendOtpDto,
  ) {
    return this.authService.sendOtp(req, res, body);
  }
  
  @Post('/login')
  @ApiOperation({ summary: 'validate otp code' })
  @ApiResponse({
    status: 200,
    description: 'the otp code validate and user login successfully',
    schema: {
      example: {
        success: true,
        message: 'با موفقیت وارد شدید',
        error: null,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this code already sendt',
        error: 'duplicate sent code',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: validateOtpDto,
    description: 'Json structure for project object',
  })
  login(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: validateOtpDto,
  ) {
    return this.authService.validateOtp(body);
  }

  @Post('/login/password')
  @ApiOperation({ summary: 'login with password' })
  @ApiResponse({
    status: 200,
    description: 'user login with password successfully',
    schema: {
      example: {
        success: true,
        message: 'با موفقیت وارد شدید',
        error: null,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'invalid credentials or user not found',
    schema: {
      example: {
        success: false,
        message: 'رمز با شماره تلفن همخوانی ندارد',
        error: 'رمز با شماره تلفن همخوانی ندارد',
        data: null,
      },
    },
  })
  @ApiBody({
    type: loginWithPasswordDto,
    description: 'Json structure for login with password',
  })
  loginWithPassword(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: loginWithPasswordDto,
  ) {
    return this.authService.loginWithPassword(body.phoneNumber, body.password);
  }
  
  @Post('/refresh')
  @ApiOperation({ summary: 'get token ' })
  @ApiResponse({
    status: 200,
    description: 'token generated',
    schema: {
      example: {
        success: true,
        message: 'با موفقیت وارد شدید',
        error: null,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this code already sendt',
        error: 'duplicate sent code',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: refreshTokenDto,
    description: 'Json structure for project object',
  })
  refreshToken(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: refreshTokenDto,
  ) {
    return this.authService.refreshToken(body);
  }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')flo
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
