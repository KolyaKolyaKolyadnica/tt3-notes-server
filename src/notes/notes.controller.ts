import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getAllNotes() {
    return this.notesService.getAllNotes();
  }

  @Get(':id')
  async getNoteById(@Param('id') id: string) {
    return this.notesService.getNoteById(id);
  }

  @Post()
  async addNote(@Body() dto: CreateNoteDto) {
    return this.notesService.addNote(dto);
  }

  @Put(':id')
  async updateTextOfNote(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.updateNote(id, dto);
  }

  @Put('move-up/:id')
  async moveUpChildNote(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.moveUpChildNote(id, dto);
  }

  @Put('move-down/:id')
  async moveDownChildNote(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.moveDownChildNote(id, dto);
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }

  @Delete('remove-sublist/:id')
  async removeSublist(@Param('id') id: string) {
    return this.notesService.removeSublist(id);
  }
}
