import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotesModule } from 'src/notes/notes.module';
import { User, UserSchema } from 'src/models/user-shema';
import { Token, TokenSchema } from 'src/models/token-shema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    NotesModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
