import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokensModule } from '../tokens/tokens.module';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [TokensModule, NotesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
