// kafka/kafka.module.ts
import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka.producer';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
        ClientsModule.register([
          {
            name: 'KAFKA_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'user-service',
                brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
              },
              consumer: {
                groupId: 'user-consumer',
              },
            },
          },
        ]),
      ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
