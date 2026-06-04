import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/user.module';
// import { KafkaService } from './kafka/kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisService } from './redis/redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './common/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({
      isGlobal:true,
      load: [configuration],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule], // 👈 تزریق ConfigModule
      inject: [ConfigService], // 👈 تزریق ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    // ClientsModule.register([
    //   {
    //     name: 'KAFKA_SERVICE',
    //     transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         clientId: 'user-service',
    //         brokers: ['localhost:9092'],
    //       },
    //       consumer: {
    //         groupId: 'user-service-consumer',
    //       },
    //     },
    //   },
    // ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // چون خارج از داکر ران می‌کنیم
      port: 5432,
      username: 'user',
      password: '25255225',
      database: 'user_db',
      autoLoadEntities: true, // بسیار مهم: این گزینه باعث می‌شود Entityها را خودکار پیدا کند
      synchronize: true, // برای محیط توسعه عالی است (جداول را خودکار می‌سازد)
    }),
    UsersModule,
    UsersModule,
  ],
  controllers: [],
  providers: [ RedisService],
})
export class AppModule {}
