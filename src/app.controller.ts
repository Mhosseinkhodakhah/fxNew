import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {KafkaProducerService} from "../src/kafka/kafka.producer"
import { Get } from '@nestjs/common/decorators/http/request-mapping.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService
    
    // , private kafkaService : KafkaProducerService
  
  ) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }


}
