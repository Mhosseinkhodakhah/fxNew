import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'کد ورود من',
      statusCode: 200,
      data: 'کد ورود منقضی شده است'
    }
  }
}
