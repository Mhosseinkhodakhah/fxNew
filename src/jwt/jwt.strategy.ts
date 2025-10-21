import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_USER_SECRET!,
    });
  }

  async validate(payload: any) {
    // const user = await this.usersService.findOne(payload.phone);
    return { userId: payload._id, phoneNumber: payload.phoneNumber };
  }
}

