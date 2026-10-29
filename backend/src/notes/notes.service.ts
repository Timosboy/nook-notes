import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from './note.entity';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  findAll(archived = false): Promise<Note[]> {
    return this.notesRepository.findAll(archived);
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

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);
    Object.assign(note, dto);

    return this.notesRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);

    await this.notesRepository.remove(note);
  }
}
