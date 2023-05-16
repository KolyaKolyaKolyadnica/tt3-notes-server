import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  UseFilters,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';
import { AllExceptionsFilter } from 'src/exeptions/all-exeptions.filter';

@UseFilters(AllExceptionsFilter)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('all/:userId')
  async getAllNotes(@Param('userId') userId: string) {
    return this.notesService.getAllNotes(userId);
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
    console.log('@Put Param===========', id, dto);
    console.log('@Put Body ===========', dto);

    return this.notesService.updateNote(id, dto);
  }

  @Put('move/:id')
  async moveChildNote(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @Query() query: { direction: string },
  ) {
    return this.notesService.moveChildNote(id, dto, query.direction);
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
