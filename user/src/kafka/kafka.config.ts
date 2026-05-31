// kafka/kafka.config.ts
import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConsumerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'user-service',
      brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
    },
    consumer: {
      groupId: 'user-consumer',
      sessionTimeout: 10000,
      rebalanceTimeout: 10000,
      heartbeatInterval: 3000,
    },
    subscribe: {
      fromBeginning: false,
    },
  },
};
