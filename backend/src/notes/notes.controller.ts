import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(): Promise<Note[]> {
    return this.notesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Note> {
    return this.notesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(dto);
  }
}
