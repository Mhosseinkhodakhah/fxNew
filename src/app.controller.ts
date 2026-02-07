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



 
  /**
   * \this is for test only 
   * @param message
   * @param context
   * @returns
   */
  @EventPattern('test-kafka')
  async handleUserFoekafka(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {


    console.log(message , "message is here ")

    const { name } = message;

    console.log(name, " im here in hande create user in userr controller ");
    

    await this.userservice.createSpeceficUserForTestKafka(name);

    // await this.kafkaService.sendMessage('test-kafka', {
    //   name
    // });

    const offset = context.getMessage().offset;
    const partition = context.getPartition();

    console.log(
      `Received test-kafka partition ${partition}, offset ${offset}`,
    );
  }
}
