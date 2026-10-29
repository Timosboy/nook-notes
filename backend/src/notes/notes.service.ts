import { Injectable } from '@nestjs/common';
import { Note } from './note.entity';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  findAll(): Promise<Note[]> {
    return this.notesRepository.findAll();
  }

  create(dto: CreateNoteDto): Promise<Note> {
    return this.notesRepository.create({
      title: dto.title,
      content: dto.content ?? '',
    });
  }
}
