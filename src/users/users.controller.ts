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
import { UserDtoBody, UserLoginDtoBody } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Response, Request } from 'express';
import { AllExceptionsFilter } from 'src/exeptions/all-exeptions.filter';

@UseFilters(AllExceptionsFilter)
@Controller('auth')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('activate/:link')
  async getUserActivate(@Param('link') activationLink: string, @Res() res) {
    await this.userService.activate(activationLink);
    return res.redirect(process.env.CLIENT_URL);
  }

  @Post('registration')
  async registration(
    @Body() dto: UserDtoBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.userService.registration(dto);

    response.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  @Post('login')
  async login(
    @Body() dto: UserLoginDtoBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.userService.login(dto);

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
    // throw new Error('das');
    console.log('LOGOUT!! :D');

    const token = await this.userService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken');
    return token;
    // return this.userService.logout();
  }

  @Get('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(
      'check auth. request.cookies.refreshToken',
      request.cookies.refreshToken,
    );
    const data = await this.userService.refresh(request.cookies.refreshToken);

    response.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return data;
  }
}
