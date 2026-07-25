import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { loggerConfig } from './config/logger.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const configuredUrl = configService.get<string>('frontendUrl');
  
  let allowedOrigins: string[];
  if (configuredUrl) {
    allowedOrigins = configuredUrl.split(',').map(url => url.trim());
  } else {
    // Default production origins
    allowedOrigins = ['https://mdptours.com', 'https://www.mdptours.com'];
    // Add local origins only in development mode
    if (nodeEnv !== 'production') {
      allowedOrigins.push('http://localhost:5173', 'http://localhost:3001');
    }
  }

  app.use(helmet({
    crossOriginResourcePolicy: false, // Fixes CORS issues with Helmet
  }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // required if sending cookies
  });
  
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser.default());

  const config = new DocumentBuilder()
    .setTitle('MDP Tours API')
    .setDescription('The MDP Tours API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
