import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ForbiddenException, ValidationPipe } from '@nestjs/common';
import { kafkaConsumerConfig } from './kafka/kafka.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as apiMetrics from 'prometheus-api-metrics';


const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function startMicroservicesWithRetry(app: any) {
  const maxAttempts = Number(process.env.KAFKA_START_MAX_RETRIES || 10);
  const retryDelayMs = Number(process.env.KAFKA_START_RETRY_DELAY_MS || 1500);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await app.startAllMicroservices();
      return;
    } catch (error: any) {
      const errorMessage = String(error?.message || '');
      const errorType = String(error?.type || '');
      const isTopicMetadataError =
        errorType === 'UNKNOWN_TOPIC_OR_PARTITION' ||
        errorMessage.includes('does not host this topic-partition') ||
        errorMessage.includes('UNKNOWN_TOPIC_OR_PARTITION');

      if (!isTopicMetadataError || attempt === maxAttempts) {
        throw error;
      }

      console.warn(
        `[Kafka] startAllMicroservices failed (${attempt}/${maxAttempts}) due to topic metadata propagation. Retrying in ${retryDelayMs}ms...`,
      );
      await wait(retryDelayMs);
    }
  }
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/metrics', (req, res, next) => {
    const allowedHost = process.env.PROMETHEUS_SERVER_URL;
    const ip = req.ip?.split(':').pop();

    if (!allowedHost || !ip?.includes(allowedHost)) {
      throw new ForbiddenException('Access Denied');
    }

    next();
  });

  app.use(
    apiMetrics.expressMiddleware({
      metricsPath: '/metrics',
      durationBuckets: [0.1, 0.5, 1, 1.5, 2, 5],
    }),
  );
  
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors({
    origin: '*', // specify the allowed origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // specify the allowed HTTP methods
  });
  process.on('unhandledRejection', (error) => {
    console.log('error occured . . .', error);
  });

  process.on('uncaughtException', (error) => {
    console.log('error occured', error);
  });

  process.on('unhandledException', (error) => {
    console.log('error occured . . .', error);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform is recomended configuration for avoind issues with arrays of files transformations
    }),
  );
  const options = new DocumentBuilder()
    .setTitle('Khanetala E-commerce User Service APIs')
    .setDescription('this is api documentation of Ecommerce project')
    .setVersion('1.0')
    .addServer('http://localhost:9010/', 'Local environment')
    .addServer("https://shop.khanetalaa.ir/v1/main", 'Stage')
    .addTag('User Service')
    .addBearerAuth()
    .build();
  process.nextTick(() => {
    console.log('next tick done');
  });
  const document = SwaggerModule.createDocument(app, options);

  app.getHttpAdapter().get('/api-docs-json', (req, res) => {
    if (req.headers['referer'] != process.env.SWAGGERUI_SERVER_URL) {
      throw new ForbiddenException('Access Denied');
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  const loggingInterceptor = app.get(LoggingInterceptor);
  app.useGlobalInterceptors(new ResponseInterceptor(), loggingInterceptor);
  
  app.useGlobalFilters(new HttpExceptionFilter());
  app.connectMicroservice(kafkaConsumerConfig);
  await startMicroservicesWithRetry(app);

  await app.listen(process.env.PORT ?? 9010);
}
bootstrap();
