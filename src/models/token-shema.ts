import { Schema, model } from 'mongoose';

const token = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    refreshToken: {
      type: String,
      require: true,
    },
  },
  { versionKey: false },
);

const Token = model('token', token);

module.exports = Token;
