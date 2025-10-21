// src/rabbitmq/rabbitmq.service.ts

// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import * as amqp from 'amqplib';

import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel , ConfirmChannel} from 'amqplib';
// import { Cache } from 'cache-manager';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { walletData } from 'src/user/interface/interfaces';


@Injectable()
export class RabbitMqService {
    private channelWrapper: ChannelWrapper;              // make the channel wrapper
    constructor() {
        const connection = amqp.connect(['amqp://localhost']);     // connect to rabbitmq when the module inject
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////!
        //*its for assert the queues
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////!
        this.channelWrapper = connection.createChannel({              // crathe the channel
            setup: (channel: Channel) => {                                    // setup the channel
                channel.assertQueue('user', { durable: true });          // assert the queue
                channel.assertQueue('wallet', { durable: true });          // assert the queue
                channel.assertQueue('order', { durable: true });          // assert the queue
            },
        });

        /**
         * here is for listening to chanels from user service in comstructor
         */
        this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {          // add setup for channel
            await channel.consume('user', async (message) => {
                const data = JSON.parse(message.content.toString())
            })
        })
    }



    /**
     * this function is example of the sending data to specific channel
     * @param wallet 
     */
    async createWallt(wallet : any){
        try {
            await this.channelWrapper.sendToQueue('wallet' , Buffer.from(JSON.stringify(wallet)))
            Logger.log('Sent To Queue');    
        } catch (error) {
            console.log('something went wrong!')
        }        
    }


    ////!last line
}













// @Injectable()
// export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
//   private connection: amqp.Connection;
//   private channel: amqp.Channel;

//   async onModuleInit() {
//     this.connection = await amqp.connect('amqp://localhost:5672');
//     this.channel = await this.connection.createChannel();

//     // Example: Declare multiple queues
//     await this.channel.assertQueue('user_queue', { durable: true });
//     await this.channel.assertQueue('order_queue', { durable: true });

//     // Example: Consumer for user_queue
//     this.channel.consume('user_queue', (msg) => {
//       if (msg) {
//         const content = msg.content.toString();
//         console.log('Received in user_queue:', content);
//         this.channel.ack(msg);
//       }
//     });

//     // You can create more consumers here as needed
//   }

//   async sendToQueue(queue: string, message: any) {
//     if (!this.channel) throw new Error('RabbitMQ channel not initialized');
//     this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
//       persistent: true,
//     });
//   }

//   async onModuleDestroy() {
//     await this.channel?.close();
//     await this.connection?.close();
//   }
// }
