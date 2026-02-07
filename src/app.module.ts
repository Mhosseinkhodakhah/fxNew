import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { HttpService } from './http/http.service';
import { CacheModule } from '@nestjs/cache-manager';
import { WinstonModule } from 'nest-winston';
import { winstonAsyncConfig } from 'configs/winston.config';
import { RabbitMqService } from './rabbitmq/rabbitmq.service';
import { UserSchema2 } from './user/entities/user.entity';
import { RedisServiceService } from './redis-service/redis-service.service';
import { TokenizeService } from './tokenize/tokenize.service';
import { JwtService } from '@nestjs/jwt';
import { InterserviceService } from './interservice/interservice.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerService } from './logger/logger.service';
import { KafkaModule } from './kafka/kafka.module';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { IdentityService } from './identity/identity.service';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRootAsync(winstonAsyncConfig),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    MongooseModule.forFeature([{ name: 'userM', schema: UserSchema2 }]),
    KafkaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RabbitMqService,
    RedisServiceService,
    TokenizeService,
    JwtService,
    InterserviceService,
    LoggingInterceptor,
    LoggerService,
    IdentityService,
  ],
})
export class AppModule {}


