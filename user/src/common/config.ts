

export default () => ({
    port: parseInt(process.env.PORT!!, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    kafka: {
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        clientId: process.env.KAFKA_CLIENT_ID || 'my-app',
        consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'my-consumer-group',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT!!, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB!!, 10) || 0,
        username: process.env.REDIS_USERNAME,
    },
});
