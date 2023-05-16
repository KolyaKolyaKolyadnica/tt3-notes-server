import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const mongoose = require('mongoose');

require('dotenv').config();
const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;

async function bootstrap() {
  await mongoose.connect(DB_HOST);

  console.log('Database connection successful');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });
  app.use(cookieParser());

  await app.listen(PORT);

  console.log(`Server running. Use our API on port: ${PORT}`);
}
bootstrap();
