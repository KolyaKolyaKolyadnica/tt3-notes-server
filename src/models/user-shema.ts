import { Schema, model } from 'mongoose';
const user = new Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    username: {
      type: String,
      require: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    activationLink: {
      type: String,
    },
  },
  { versionKey: false },
);

const User = model('user', user);

module.exports = User;

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';

// export type UserQQQDocument = HydratedDocument<UserQQQ>;

// @Schema()
// export class UserQQQ {
//   @Prop({ required: true, unique: true })
//   email: string;

//   @Prop({ required: true })
//   password: string;

//   @Prop({ default: 'Anonymus' })
//   username: string;

//   @Prop({ default: false })
//   isActivated: boolean;

//   @Prop()
//   activationLink: string;
// }

// export const User = SchemaFactory.createForClass(UserQQQ);
