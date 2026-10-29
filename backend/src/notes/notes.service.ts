import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from './note.entity';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  findAll(): Promise<Note[]> {
    return this.notesRepository.findAll();
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findById(id);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  create(dto: CreateNoteDto): Promise<Note> {
    return this.notesRepository.create({
      title: dto.title,
      content: dto.content ?? '',
    });
  }
}
