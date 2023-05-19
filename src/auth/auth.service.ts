import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { NotesService } from 'src/notes/notes.service';
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

import { User } from 'src/models/user-shema';
// const User = require('../models/user-shema');
const Token = require('../models/token-shema');
const Note = require('../models/notes-shema');

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// const uuid = require('uuid'); // По сути не нужный пакет т.к. есть crypto

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
    // const candidate: IUser = await User.findOne({ email });
    if (candidate) {
      throw new BadRequestException({
        message: `Пользователь с таким email (${email}) уже зарегестрирован.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const hashPassword = await bcrypt.hash(password, 5);

    // const activationLink = uuid.v4();
    const activationLink = randomUUID();

    const user = await this.userModel.create({
      ...dto,
      password: hashPassword,
      activationLink,
    });
    // const user = await User.create({
    //   ...dto,
    //   password: hashPassword,
    //   activationLink,
    // });

    await this.sendActivationEmail(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`,
    );

    console.log('===');
    console.log('===');
    console.log('user === ', user);
    console.log('===');
    console.log('===');

    await this.notesService.addNote({
      parentId: null,
      text: 'Start',
      childrenId: [],
      userId: user._id.toString(),
    });
    // await this.notesService.addNote({
    //   parentId: null,
    //   text: 'Start',
    //   childrenId: [],
    //   userId: user._id,
    // });

    return await this.addTokensToUser(user);
  }

  async login(dto) {
    const { email, password } = dto;

    const user: IUser = await this.userModel.findOne({ email });
    // const user: IUser = await User.findOne({ email });
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
    const token = await this.removeToken(refreshToken);
    return token;
  }

  async activate(activationLink) {
    const user = await this.userModel.findOne({ activationLink });
    // const user = await User.findOne({ activationLink });
    if (!user) {
      throw new BadRequestException({
        message: 'Некорректная ссылка активации.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    user.isActivated = true;
    await user.save();

    const firstNote = await this.notesService.addNote({
      userId: user._id.toString(),
      text: '',
      parentId: null,
      childrenId: [],
    });
    // const firstNote = await this.notesService.addNote({
    //   userId: user._id,
    //   text: '',
    //   parentId: null,
    //   childrenId: [],
    // });
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Не найден refreshToken',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    // console.log('refreshToken =============', refreshToken);

    const userData = this.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.findToken(refreshToken);

    // console.log('tokenFromDb ============', tokenFromDb);

    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException({
        message: 'Не найден refreshToken или токен не валидный.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const user = await this.userModel.findById(tokenFromDb.user);
    // const user = await User.findById(tokenFromDb.user);

    return await this.addTokensToUser(user);
  }

  async addTokensToUser(user) {
    const userDto = new AuthDto(user);

    // Генерируем аксес и рефреш токены, закладывая в них "не важные" данные (не пароль)
    const tokens = this.generateToken({ ...userDto });

    // Ф-ция из tokensService добавит токен в БД
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
    const tokenData = await Token.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;

      return await tokenData.save();
    }

    const newToken = await Token.create({ user: userId, refreshToken });

    return newToken;
  }

  async removeToken(token) {
    return await Token.deleteOne({ refreshToken: token });
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
    return await Token.findOne({ refreshToken: token });
  }
}
