import { CurrentUser } from '../auth/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { ListNotesQuery } from './dto/list-notes.query';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query() query: ListNotesQuery,
  ): Promise<Note[]> {
    return this.notesService.findAll(userId, query.archived, query.categoryId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Note> {
    return this.notesService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body() dto: CreateNoteDto,
  ): Promise<Note> {
    return this.notesService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.update(userId, id, dto);
  }

  @Patch(':id/archive')
  archive(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Note> {
    return this.notesService.archive(userId, id);
  }

  @Patch(':id/unarchive')
  unarchive(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Note> {
    return this.notesService.unarchive(userId, id);
  }

  @Patch(':id/pin')
  pin(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Note> {
    return this.notesService.pin(userId, id);
  }

  @Patch(':id/unpin')
  unpin(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Note> {
    return this.notesService.unpin(userId, id);
  }

  @Put(':id/categories/:categoryId')
  addCategory(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<Note> {
    return this.notesService.addCategory(userId, id, categoryId);
  }

  @Delete(':id/categories/:categoryId')
  removeCategory(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<Note> {
    return this.notesService.removeCategory(userId, id, categoryId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.notesService.remove(userId, id);
  }
}
