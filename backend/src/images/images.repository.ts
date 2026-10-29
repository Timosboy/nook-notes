import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteImage } from './note-image.entity';

export type NewNoteImage = Pick<
  NoteImage,
  'noteId' | 'filename' | 'mimeType' | 'size' | 'data'
>;

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(NoteImage)
    private readonly images: Repository<NoteImage>,
  ) {}

  countByNoteId(noteId: string): Promise<number> {
    return this.images.countBy({ noteId });
  }

  create(image: NewNoteImage): Promise<NoteImage> {
    return this.images.save(this.images.create(image));
  }

  findById(noteId: string, id: string): Promise<NoteImage | null> {
    return this.images
      .createQueryBuilder('image')
      .addSelect('image.data')
      .where('image.noteId = :noteId', { noteId })
      .andWhere('image.id = :id', { id })
      .getOne();
  }

  async remove(image: NoteImage): Promise<void> {
    await this.images.remove(image);
  }
}
