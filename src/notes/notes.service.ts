import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
const Note = require('./notesShema');

@Injectable()
export class NotesService {
  constructor() {}

  async getAllNotes() {
    const notes = await Note.find({});
    return notes;
  }

  async getNoteById(id: string) {
    // const note = await Note.findById(id).exec() // Нафіга цей ехес()???
    const note = await Note.findById(id);
    return note;
  }

  async addNote(dto: CreateNoteDto) {
    const note = new Note(dto);
    await note.save();

    const parentNode = await this.getNoteById(dto.parentId);
    parentNode.childrenId = [...parentNode.childrenId, note.id];
    await parentNode.save();

    return note;
  }

  async deleteAllChildren(id: string) {
    const rootNote = await this.getNoteById(id);

    rootNote.childrenId.forEach(async (children: string) => {
      this.deleteAllChildren(children);
      await Note.findByIdAndDelete(children);
    });
  }

  async deleteNote(id: string) {
    await this.deleteAllChildren(id);

    const note = await Note.findByIdAndDelete(id);

    const parentNode = await this.getNoteById(note.parentId);
    parentNode.childrenId = parentNode.childrenId.filter(
      (item) => item !== note.id,
    );
    await parentNode.save();

    return note;
  }

  async removeSublist(id: string) {
    await this.deleteAllChildren(id);

    const note = await this.getNoteById(id);
    note.childrenId = [];
    await note.save();

    return note;
  }

  async updateNote(id: string, dto: UpdateNoteDto) {
    const note = await Note.findByIdAndUpdate(id, dto);
    return note;
  }

  async moveUpChildNote(id: string, dto: UpdateNoteDto) {
    const idx = dto.childrenId.findIndex((item) => item === id);
    const newArrIds = [...dto.childrenId];
    [newArrIds[idx], newArrIds[idx - 1]] = [newArrIds[idx - 1], newArrIds[idx]];

    return await this.updateNote(dto._id, {
      ...dto,
      childrenId: newArrIds,
    });
  }

  async moveDownChildNote(id: string, dto: UpdateNoteDto) {
    const idx = dto.childrenId.findIndex((item) => item === id);
    const newArrIds = [...dto.childrenId];
    [newArrIds[idx], newArrIds[idx + 1]] = [newArrIds[idx + 1], newArrIds[idx]];

    return await this.updateNote(dto._id, {
      ...dto,
      childrenId: newArrIds,
    });
  }
}
