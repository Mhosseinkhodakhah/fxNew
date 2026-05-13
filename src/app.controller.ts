import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {KafkaProducerService} from "../src/kafka/kafka.producer"
import { Get } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { EventPattern , Payload,Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
import { UserService } from './user/user.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly userservice : UserService,
    private readonly kafkaService : KafkaProducerService
    
    // , private kafkaService : KafkaProducerService
  
  ) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }
 
}
