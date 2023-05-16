import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

const DB_HOST = process.env.DB_HOST;

@Module({
  imports: [
    NotesModule,
    UsersModule,
    // MongooseModule.forRoot(DB_HOST)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
