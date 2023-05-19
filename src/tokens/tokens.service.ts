import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
const Token = require('../models/token-shema');
const jwt = require('jsonwebtoken');

@Injectable()
export class TokensService {
  constructor() {}

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
