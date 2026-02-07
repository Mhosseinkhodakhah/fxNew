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
   await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 9010);
}
bootstrap();
