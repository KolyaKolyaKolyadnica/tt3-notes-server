import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Res,
  Req,
  UseFilters,
} from '@nestjs/common';
import { AuthDtoBody, AuthLoginDtoBody } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { AllExceptionsFilter } from 'src/exeptions/all-exeptions.filter';

@UseFilters(AllExceptionsFilter)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('activate/:link')
  async getUserActivate(@Param('link') activationLink: string, @Res() res) {
    await this.authService.activate(activationLink);
    return res.redirect(process.env.CLIENT_URL);
  }

  @Post('registration')
  async registration(
    @Body() dto: AuthDtoBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.registration(dto);

    response.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  @Post('login')
  async login(
    @Body() dto: AuthLoginDtoBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(dto);

    response.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken');
    return token;
  }

  @Get('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.refresh(request.cookies.refreshToken);

    response.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }
}
