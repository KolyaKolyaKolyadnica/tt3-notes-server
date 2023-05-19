import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './middleware/auth.middleware';
import { NotesController } from './notes/notes.controller';
require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
console.log(DB_HOST);

@Module({
  imports: [
    NotesModule,
    AuthModule,
    MongooseModule.forRoot(process.env.DB_HOST),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(NotesController, {
      path: 'auth/logout',
      method: RequestMethod.POST,
    });
  }
}
// .exclude({
//   path: 'checkAccessToken/:accessToken',
//   method: RequestMethod.GET,
// })
// export class AppModule {}
