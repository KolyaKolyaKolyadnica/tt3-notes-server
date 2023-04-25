import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const mongoose = require('mongoose');

require('dotenv').config();
const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;

async function bootstrap() {
  await mongoose.connect(DB_HOST);

  console.log('Database connection successful');

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT);

  console.log(`Server running. Use our API on port: ${PORT}`);
}
bootstrap();
