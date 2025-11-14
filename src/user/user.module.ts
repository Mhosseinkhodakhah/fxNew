// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
// import { UserSchema2 } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { InterserviceService } from '../interservice/interservice.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { JwtAdminStrategy } from 'src/jwt/admin-jwt.strategy';
import { KafkaModule } from 'src/kafka/kafka.module';
import { LockerService } from 'src/locker/locker.service';
import { RedisServiceService } from 'src/redis-service/redis-service.service';
import { ConfigService } from '@nestjs/config';
import { IdentityService } from 'src/identity/identity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([
  User]),
  KafkaModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
    InterserviceService,
    JwtService,
    JwtStrategy,
    JwtAdminStrategy,
    LockerService,
    RedisServiceService,
    ConfigService,
    IdentityService
  ],
})
export class UserModule {}
