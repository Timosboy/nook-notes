import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { Note } from './note.entity';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAll(
    userId: string,
    archived = false,
    categoryId?: string,
  ): Promise<Note[]> {
    return this.notesRepository.findAll(userId, archived, categoryId);
  }

  async findOne(userId: string, id: string): Promise<Note> {
    const note = await this.notesRepository.findById(userId, id);

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  create(userId: string, dto: CreateNoteDto): Promise<Note> {
    return this.notesRepository.create({
      userId,
      title: dto.title,
      content: dto.content ?? '',
      emoji: dto.emoji ?? null,
    });
  }

  async update(userId: string, id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(userId, id);
    Object.assign(note, dto);

    return this.notesRepository.save(note);
  }

  archive(userId: string, id: string): Promise<Note> {
    return this.setArchived(userId, id, true);
  }

  unarchive(userId: string, id: string): Promise<Note> {
    return this.setArchived(userId, id, false);
  }

  async pin(userId: string, id: string): Promise<Note> {
    const note = await this.findOne(userId, id);

    if (note.archived) {
      throw new BadRequestException('Archived notes cannot be pinned');
    }

    const pinned = await this.notesRepository.setPinned(userId, id, true);

    if (!pinned) {
      throw new NotFoundException('Note not found');
    }

    return pinned;
  }

  async unpin(userId: string, id: string): Promise<Note> {
    await this.findOne(userId, id);
    const unpinned = await this.notesRepository.setPinned(userId, id, false);

    if (!unpinned) {
      throw new NotFoundException('Note not found');
    }

    return unpinned;
  }

  async addCategory(
    userId: string,
    id: string,
    categoryId: string,
  ): Promise<Note> {
    const note = await this.findOne(userId, id);
    const category = await this.categoriesService.findOne(userId, categoryId);

    if (hasCategory(note, categoryId)) {
      return note;
    }

    note.categories = [...note.categories, category];
    await this.notesRepository.save(note);

    return this.findOne(userId, id);
  }

  async removeCategory(
    userId: string,
    id: string,
    categoryId: string,
  ): Promise<Note> {
    const note = await this.findOne(userId, id);
    note.categories = note.categories.filter(({ id }) => id !== categoryId);

    return this.notesRepository.save(note);
  }

  private async setArchived(
    userId: string,
    id: string,
    archived: boolean,
  ): Promise<Note> {
    const note = await this.findOne(userId, id);
    note.archived = archived;

    if (archived) {
      note.pinned = false;
    }

    return this.notesRepository.save(note);
  }

  async remove(userId: string, id: string): Promise<void> {
    const note = await this.findOne(userId, id);

    await this.notesRepository.remove(note);
  }
}

function hasCategory(note: Note, categoryId: string): boolean {
  return note.categories.some(({ id }) => id === categoryId);
}
