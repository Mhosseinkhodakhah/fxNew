import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config'; 
import { JwtStrategy } from '../jwt/jwt.strategy';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';  
import { UserService } from 'src/user/user.service';
import { TokenizeService } from 'src/tokenize/tokenize.service';
import { RedisServiceService } from 'src/redis-service/redis-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema2 } from 'src/user/entities/user.entity';
import { InterserviceService } from 'src/interservice/interservice.service';
import { KafkaModule } from '../kafka/kafka.module';
import { IdentityService } from 'src/identity/identity.service';

@Module({
  imports: [
    UserModule,
    KafkaModule,
    PassportModule,
    ConfigModule,  
    JwtModule.registerAsync({
      imports: [ConfigModule],  
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // secret: configService.get('JWT_USER_SECRET'),
        // signOptions: { expiresIn: '7d' },  
      }),
    }),
    MongooseModule.forFeature([{ name: 'userM', schema: UserSchema2 }])
  ],
  controllers: [AuthController],
  providers: [AuthService,UserService,JwtAuthGuard,JwtStrategy , IdentityService , TokenizeService , RedisServiceService,InterserviceService],
})
export class AuthModule {}
