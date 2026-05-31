import { Transport } from "@nestjs/microservices";

export const TOPICS = {
  USERS: {
    GET_INFO: 'get_user_info',
    FIND_OR_CREATE: 'find_or_create',
    UPDATE_INFO: 'update_info',
    GET_ALL_USERS: 'get_all_users',
    SUSPEND_USER: 'suspend_user',
    CHANGE_ROLE: 'change_role',
  },
};





export const kafkaConfig = {kafka : {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'user-service-consumer',
      },
    },
  }}