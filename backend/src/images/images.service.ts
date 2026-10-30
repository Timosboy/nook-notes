import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotesService } from '../notes/notes.service';
import { detectImageType } from './image-type';
import { ImagesRepository } from './images.repository';
import { NoteImage } from './note-image.entity';

const MAX_IMAGES_PER_NOTE = 30;

export type NoteImageMetadata = Pick<
  NoteImage,
  'id' | 'filename' | 'mimeType' | 'size' | 'createdAt'
>;

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly notesService: NotesService,
  ) {}

  async upload(
    userId: string,
    noteId: string,
    file?: Express.Multer.File,
  ): Promise<NoteImageMetadata> {
    await this.notesService.findOne(userId, noteId);

    if (!file) {
      throw new BadRequestException('No image was uploaded');
    }

    const mimeType = detectImageType(file.buffer);

    if (!mimeType) {
      throw new BadRequestException(
        'Only JPEG, PNG, GIF or WebP images are allowed',
      );
    }

    const count = await this.imagesRepository.countByNoteId(noteId);

    if (count >= MAX_IMAGES_PER_NOTE) {
      throw new BadRequestException(
        `A note can have up to ${MAX_IMAGES_PER_NOTE} images`,
      );
    }

    const image = await this.imagesRepository.create({
      noteId,
      filename: file.originalname,
      mimeType,
      size: file.size,
      data: file.buffer,
    });

    return metadata(image);
  }

  async findOne(
    userId: string,
    noteId: string,
    id: string,
  ): Promise<NoteImage> {
    await this.notesService.findOne(userId, noteId);
    const image = await this.imagesRepository.findById(noteId, id);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async remove(userId: string, noteId: string, id: string): Promise<void> {
    const image = await this.findOne(userId, noteId, id);

    await this.imagesRepository.remove(image);
  }
}

function metadata(image: NoteImage): NoteImageMetadata {
  return {
    id: image.id,
    filename: image.filename,
    mimeType: image.mimeType,
    size: image.size,
    createdAt: image.createdAt,
  };
}
