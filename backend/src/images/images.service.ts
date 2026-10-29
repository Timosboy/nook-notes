import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotesService } from '../notes/notes.service';
import { detectImageType } from './image-type';
import { ImagesRepository } from './images.repository';
import { NoteImage } from './note-image.entity';

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
    noteId: string,
    file?: Express.Multer.File,
  ): Promise<NoteImageMetadata> {
    await this.notesService.findOne(noteId);

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

    if (count >= 10) {
      throw new BadRequestException('A note can have up to 10 images');
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

  async findOne(noteId: string, id: string): Promise<NoteImage> {
    const image = await this.imagesRepository.findById(noteId, id);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async remove(noteId: string, id: string): Promise<void> {
    const image = await this.findOne(noteId, id);

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
