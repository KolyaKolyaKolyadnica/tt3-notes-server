import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type TokenDocument = mongoose.HydratedDocument<Token>;

@Schema()
export class Token {
  @Prop({ required: true, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  refreshToken: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
