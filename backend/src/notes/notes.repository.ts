import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

export type NewNote = Pick<Note, 'title' | 'content'>;

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(Note)
    private readonly notes: Repository<Note>,
  ) {}

  findAll(archived: boolean): Promise<Note[]> {
    return this.notes.find({
      where: { archived },
      relations: { categories: true },
      order: { updatedAt: 'DESC', categories: { name: 'ASC' } },
    });
  }

  findById(id: string): Promise<Note | null> {
    return this.notes.findOne({
      where: { id },
      relations: { categories: true },
      order: { categories: { name: 'ASC' } },
    });
  }

  create(note: NewNote): Promise<Note> {
    return this.notes.save(this.notes.create({ ...note, categories: [] }));
  }

  save(note: Note): Promise<Note> {
    return this.notes.save(note);
  }

  async remove(note: Note): Promise<void> {
    await this.notes.remove(note);
  }
}
