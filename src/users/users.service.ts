import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { NotesService } from 'src/notes/notes.service';
const nodemailer = require('nodemailer');

// import { User } from 'src/models/user-shema';
const User = require('../models/user-shema');

const Note = require('../models/notes-shema');

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
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
export class UsersService {
  constructor(
    private tokensService: TokensService,
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

    const candidate: IUser = await User.findOne({ email });
    if (candidate) {
      throw new BadRequestException({
        message: `Пользователь с таким email (${email}) уже зарегестрирован.`,
        error: HttpStatus.BAD_REQUEST,
      });
    }

    const hashPassword = await bcrypt.hash(password, 5);

    // const activationLink = uuid.v4();
    const activationLink = randomUUID();

    const user = await User.create({
      ...dto,
      password: hashPassword,
      activationLink,
    });

    await this.sendActivationEmail(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`,
    );

    return await this.addTokensToUser(user);
  }

  async login(dto) {
    const { email, password } = dto;

    const user: IUser = await User.findOne({ email });
    if (!user) {
      throw new BadRequestException({
        message: `Пользователь с таким email (${email}) не найден.`,
        error: HttpStatus.BAD_REQUEST,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException({
        message: 'Неверный пароль.',
        error: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.addTokensToUser(user);
  }

  async logout(refreshToken) {
    const token = await this.tokensService.removeToken(refreshToken);
    return token;
  }

  async activate(activationLink) {
    const user = await User.findOne({ activationLink });
    if (!user) {
      throw new BadRequestException({
        message: 'Некорректная ссылка активации.',
        error: HttpStatus.BAD_REQUEST,
      });
    }

    user.isActivated = true;
    await user.save();

    const firstNote = await this.notesService.addNote({
      userId: user._id,
      text: '',
      parentId: null,
      childrenId: [],
    });
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Не найден refreshToken',
        error: HttpStatus.UNAUTHORIZED,
      });
    }
    console.log('refreshToken =============', refreshToken);

    const userData = this.tokensService.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.tokensService.findToken(refreshToken);

    console.log('userData =============', userData);
    console.log('tokenFromDb ============', tokenFromDb);

    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException({
        message: 'Не найден refreshToken или токен не валидный.',
        error: HttpStatus.UNAUTHORIZED,
      });
    }

    const user = await User.findById(tokenFromDb.user);

    return await this.addTokensToUser(user);
  }

  async addTokensToUser(user) {
    const userDto = new UserDto(user);

    // Генерируем аксес и рефреш токены, закладывая в них "не важные" данные (не пароль)
    const tokens = this.tokensService.generateToken({ ...userDto });
    // Ф-ция из tokensService добавит токен в БД
    await this.tokensService.saveToken(user._id, tokens.refreshToken);

    return {
      ...tokens,
      ...userDto,
    };
  }

  async getUsers() {
    try {
    } catch (error) {}
  }
}
