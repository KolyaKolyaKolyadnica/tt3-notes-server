import {
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        throw new UnauthorizedException({
          message: 'Отсутствует заголовок авторизации.',
          error: HttpStatus.UNAUTHORIZED,
        });
      }

      const accessToken = authorizationHeader.split(' ')[1];
      if (!accessToken) {
        throw new UnauthorizedException({
          message: 'Отсутствует аксесс токен.',
          error: HttpStatus.UNAUTHORIZED,
        });
      }

      const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      if (!userData) {
        throw new UnauthorizedException({
          message: 'Невалидный аксесс токен.',
          error: HttpStatus.UNAUTHORIZED,
        });
      }
      //   req.user = userData;

      next();
    } catch (error) {
      console.log('Ошибка в мидлваре.', error);

      throw new UnauthorizedException({
        message: 'Ошибка в мидлваре.',
        error: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}
