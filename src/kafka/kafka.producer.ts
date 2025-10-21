import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'user-producer',
    brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
  });

  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
    console.log('Kafka Producer connected (user)');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    console.log('Kafka Producer disconnected (user)');
  }

  async sendMessage(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
