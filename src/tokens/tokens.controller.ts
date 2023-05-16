import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { TokensService } from './tokens.service';

@Controller('token')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  async registration(@Body() dto: CreateTokenDto) {
    return this.tokensService.saveToken(dto.userId, dto.refreshToken);
  }
}
