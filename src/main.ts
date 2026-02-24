import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // allow only your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // required if sending cookies
  });
  app.setGlobalPrefix("api/v1")
app.use(cookieParser.default()); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
