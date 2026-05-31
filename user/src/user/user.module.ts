import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Settings } from './entities/settings.entity';
import { UsersService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Settings])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
