import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NoteDocument = HydratedDocument<Note>;

@Schema()
export class Note {
  @Prop()
  parentId: string | null;

  @Prop({ default: [] })
  childrenId: string[];

  @Prop({ default: '' })
  text: string;

  @Prop({ require: true })
  userId: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
