import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from '../tokens/tokens.module';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [TokensModule, NotesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
