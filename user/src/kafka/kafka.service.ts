// kafka/kafka.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    // @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka
  
  ) {}

  async onModuleInit() {
    // Subscribe to response topics for request-reply pattern
    // this.kafkaClient.subscribeToResponseOf('my-topic');
    // await this.kafkaClient.connect();
  }

  async emit(topic: string, message: any) {
    // return this.kafkaClient.emit(topic, message);
  }
  
  async send(topic: string, payload: any) {
    // return this.kafkaClient.send(topic, payload)
  }

  async onModuleDestroy() {
    // await this.kafkaClient.close();
  }
}
