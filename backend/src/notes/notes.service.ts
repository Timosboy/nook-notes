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

  findAll(archived = false, categoryId?: string): Promise<Note[]> {
    return this.notesRepository.findAll(archived, categoryId);
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

  archive(id: string): Promise<Note> {
    return this.setArchived(id, true);
  }

  unarchive(id: string): Promise<Note> {
    return this.setArchived(id, false);
  }

  async pin(id: string): Promise<Note> {
    const note = await this.findOne(id);

    if (note.archived) {
      throw new BadRequestException('Archived notes cannot be pinned');
    }

    const pinned = await this.notesRepository.setPinned(id, true);

    if (!pinned) {
      throw new NotFoundException('Note not found');
    }

    return pinned;
  }

  async unpin(id: string): Promise<Note> {
    await this.findOne(id);
    const unpinned = await this.notesRepository.setPinned(id, false);

    if (!unpinned) {
      throw new NotFoundException('Note not found');
    }

    return unpinned;
  }

  async addCategory(id: string, categoryId: string): Promise<Note> {
    const note = await this.findOne(id);
    const category = await this.categoriesService.findOne(categoryId);

    if (hasCategory(note, categoryId)) {
      return note;
    }

    note.categories = [...note.categories, category];
    await this.notesRepository.save(note);

    return this.findOne(id);
  }

  async removeCategory(id: string, categoryId: string): Promise<Note> {
    const note = await this.findOne(id);
    note.categories = note.categories.filter(({ id }) => id !== categoryId);

    return this.notesRepository.save(note);
  }

  private async setArchived(id: string, archived: boolean): Promise<Note> {
    const note = await this.findOne(id);
    note.archived = archived;

    if (archived) {
      note.pinned = false;
    }

    return this.notesRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);

    await this.notesRepository.remove(note);
  }
}

function hasCategory(note: Note, categoryId: string): boolean {
  return note.categories.some(({ id }) => id === categoryId);
}
