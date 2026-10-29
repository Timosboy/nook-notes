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
      order: { updatedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Note | null> {
    return this.notes.findOneBy({ id });
  }

  create(note: NewNote): Promise<Note> {
    return this.notes.save(this.notes.create(note));
  }

  save(note: Note): Promise<Note> {
    return this.notes.save(note);
  }

  async remove(note: Note): Promise<void> {
    await this.notes.remove(note);
  }
}
