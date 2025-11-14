import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { HttpService } from './http/http.service';
import { WinstonModule } from 'nest-winston';
import { winstonAsyncConfig } from 'configs/winston.config';
import { RedisServiceService } from './redis-service/redis-service.service';
import { TokenizeService } from './tokenize/tokenize.service';
import { JwtService } from '@nestjs/jwt';
import { InterserviceService } from './interservice/interservice.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerService } from './logger/logger.service';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { IdentityService } from './identity/identity.service';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
 imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRootAsync(winstonAsyncConfig),
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot({
       type: 'postgres',
       host: process.env.DB_HOST,
       port: 5432,
       username: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
       entities: [
  
       ],
       synchronize: true,
     }),
      TypeOrmModule.forFeature([
 
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
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


