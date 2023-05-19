// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';

// export type NoteDocument = HydratedDocument<Note>;

// @Schema()
// export class Note {
//   @Prop({ required: true })
//   parentId: string | null;

//   @Prop({ default: [] })
//   childrenId: string[];

//   @Prop({ default: '' })
//   text: string;

//   @Prop({ require: true })
//   userId: string;
// }

// export const NoteSchema = SchemaFactory.createForClass(Note);

const mongoose = require('mongoose');
const note = new mongoose.Schema(
  {
    parentId: {
      type: String || null,
      require: true,
    },
    childrenId: {
      type: [String],
      default: [],
    },
    text: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
      require: true,
    },
  },
  { versionKey: false },
);

const Note = mongoose.model('note', note);

module.exports = Note;
