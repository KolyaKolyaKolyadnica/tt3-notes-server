import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/create-auth.dto';
import { NotesService } from 'src/notes/notes.service';
import { User } from 'src/models/user-shema';
import { Token } from 'src/models/token-shema';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

interface IUser {
  _id: string;
  email: string;
  password: string;
  username: string;
  isActivated: boolean;
  activationLink: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private notesService: NotesService,
  ) {}

  async sendActivationEmail(email, activationLink) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Activation account on ${process.env.API_URL}`,
      text: '',
      html: `
      <div>
        <h1>For activate click on link</h1>
        <a href="${activationLink}">${activationLink}</a>
      </div>
      `,
    });
  }

  async registration(dto) {
    const { email, password } = dto;
    if (!dto.username) {
      dto.username = 'Anonymus';
    }

    const candidate: IUser = await this.userModel.findOne({ email });
    if (candidate) {
      throw new BadRequestException({
        message: `Пользователь с таким email (${email}) уже зарегестрирован.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const hashPassword = await bcrypt.hash(password, 5);

    const activationLink = randomUUID();

    const user = await this.userModel.create({
      ...dto,
      password: hashPassword,
      activationLink,
    });

    await this.sendActivationEmail(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`,
    );

    await this.notesService.addNote({
      parentId: null,
      text: 'Start',
      childrenId: [],
      userId: user._id.toString(),
    });

    return await this.addTokensToUser(user);
  }

  async login(dto) {
    const { email, password } = dto;

    const user: IUser = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException({
        message: `Пользователь с таким email (${email}) не найден.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException({
        message: 'Неверный пароль.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.addTokensToUser(user);
  }

  async logout(refreshToken) {
    return await this.removeToken(refreshToken);
  }

  async activate(activationLink) {
    const user = await this.userModel.findOne({ activationLink });
    if (!user) {
      throw new BadRequestException({
        message: 'Некорректная ссылка активации.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    user.isActivated = true;
    await user.save();
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Не найден refreshToken',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const userData = this.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException({
        message: 'Не найден refreshToken или токен не валидный.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const user = await this.userModel.findById(tokenFromDb.user);

    return await this.addTokensToUser(user);
  }

  async addTokensToUser(user) {
    const userDto = new AuthDto(user);

    const tokens = this.generateToken({ ...userDto });

    await this.saveToken(user._id, tokens.refreshToken);

    return {
      ...tokens,
      ...userDto,
    };
  }

  //
  // Tokens
  //

  generateToken(payload) {
    const accessToken: string = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: '10s',
      },
    );

    const refreshToken: string = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await this.tokenModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;

      return await tokenData.save();
    }

    return await this.tokenModel.create({
      user: userId,
      refreshToken,
    });
  }

  async removeToken(token) {
    return await this.tokenModel.deleteOne({ refreshToken: token });
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  async findToken(token) {
    return await this.tokenModel.findOne({ refreshToken: token });
  }
}
