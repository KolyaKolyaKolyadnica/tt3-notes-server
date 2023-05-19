import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { Note } from 'src/models/notes-shema';
const Note = require('../models/notes-shema');

@Injectable()
export class NotesService {
  // constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}
  constructor() {}

  async getAllNotes(userId) {
    try {
      // const notes = await this.noteModel.find({ userId });
      const notes = await Note.find({ userId });
      return notes;
    } catch (error) {
      return error;
    }
  }

  async getNoteById(id: string) {
    try {
      // const note = await Note.findById(id).exec() // Нафіга цей ехес()???
      // const note = await this.noteModel.findById(id);
      const note = await Note.findById(id);

      if (!note) {
        throw new NotFoundException();
      }

      return note;
    } catch (error) {
      return error;
    }
  }

  async addNote(dto: CreateNoteDto) {
    try {
      // const note = new this.noteModel(dto);
      const note = new Note(dto);
      await note.save();

      const parentNode = await this.getNoteById(dto.parentId);

      parentNode.childrenId = [...parentNode.childrenId, note._id.toString()];
      // parentNode.childrenId = [...parentNode.childrenId, note.id];

      await parentNode.save();

      return note;
    } catch (error) {
      return error;
    }
  }

  async deleteAllChildren(id: string) {
    try {
      const rootNote = await this.getNoteById(id);

      if (rootNote.childrenId.length !== 0) {
        rootNote.childrenId.forEach(async (children: string) => {
          await this.deleteAllChildren(children);
          // await this.noteModel.findByIdAndDelete(children);
          await Note.findByIdAndDelete(children);
        });
      }
    } catch (error) {
      return error;
    }
  }

  async deleteNote(id: string) {
    try {
      await this.deleteAllChildren(id);

      // const note = await this.noteModel.findByIdAndDelete(id);
      const note = await Note.findByIdAndDelete(id);

      const parentNode = await this.getNoteById(note.parentId);
      parentNode.childrenId = parentNode.childrenId.filter(
        (item) => item !== note.id,
      );
      await parentNode.save();

      return note;
    } catch (error) {
      return error;
    }
  }

  async removeSublist(id: string) {
    try {
      await this.deleteAllChildren(id);

      const note = await this.getNoteById(id);
      note.childrenId = [];
      await note.save();

      return note;
    } catch (error) {
      return error;
    }
  }

  async updateNote(id: string, dto: UpdateNoteDto) {
    try {
      // const note = await this.noteModel.findByIdAndUpdate(id, dto);
      const note = await Note.findByIdAndUpdate(id, dto);

      return note;
    } catch (error) {
      return error;
    }
  }

  async moveChildNote(id: string, dto: UpdateNoteDto, direction: string) {
    try {
      const idx = dto.childrenId.findIndex((item) => item === id);
      const newArrIds = [...dto.childrenId];

      direction === 'up'
        ? ([newArrIds[idx], newArrIds[idx - 1]] = [
            newArrIds[idx - 1],
            newArrIds[idx],
          ])
        : ([newArrIds[idx], newArrIds[idx + 1]] = [
            newArrIds[idx + 1],
            newArrIds[idx],
          ]);

      return await this.updateNote(dto._id, {
        ...dto,
        childrenId: newArrIds,
      });
    } catch (error) {
      return error;
    }
  }
}
