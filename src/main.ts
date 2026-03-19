import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    origin: ['http://localhost:5173', 'http://localhost:3001', "https://mdptours.com", "https://www.mdptours.com"], // allow only your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // required if sending cookies
  });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser.default());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
