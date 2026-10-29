import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotesService } from '../notes/notes.service';
import { ImagesRepository } from './images.repository';
import { ImagesService } from './images.service';

jest.mock('./images.repository', () => ({
  ImagesRepository: class ImagesRepository {},
}));

jest.mock('../notes/notes.service', () => ({
  NotesService: class NotesService {},
}));

describe('ImagesService', () => {
  let service: ImagesService;
  let imagesRepository: {
    countByNoteId: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
    remove: jest.Mock;
  };
  let notesService: { findOne: jest.Mock };

  beforeEach(() => {
    imagesRepository = {
      countByNoteId: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      remove: jest.fn(),
    };
    notesService = { findOne: jest.fn() };
    service = new ImagesService(
      imagesRepository as unknown as ImagesRepository,
      notesService as unknown as NotesService,
    );
  });

  it('stores an uploaded image with its detected mime type', async () => {
    const noteId = 'note-id';
    const file = {
      originalname: 'photo.png',
      mimetype: 'text/plain',
      size: 8,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    } as Express.Multer.File;
    const image = {
      id: 'image-id',
      noteId,
      filename: file.originalname,
      mimeType: 'image/png',
      size: file.size,
      data: file.buffer,
      createdAt: new Date(),
    };
    notesService.findOne.mockResolvedValue({ id: noteId });
    imagesRepository.countByNoteId.mockResolvedValue(0);
    imagesRepository.create.mockResolvedValue(image);

    await expect(service.upload(noteId, file)).resolves.toEqual({
      id: image.id,
      filename: image.filename,
      mimeType: 'image/png',
      size: image.size,
      createdAt: image.createdAt,
    });
    expect(imagesRepository.create).toHaveBeenCalledWith({
      noteId,
      filename: file.originalname,
      mimeType: 'image/png',
      size: file.size,
      data: file.buffer,
    });
  });

  it('rejects an unknown file type', async () => {
    notesService.findOne.mockResolvedValue({ id: 'note-id' });

    await expect(
      service.upload('note-id', {
        originalname: 'file.txt',
        size: 4,
        buffer: Buffer.from('text'),
      } as Express.Multer.File),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.upload('note-id', {
        originalname: 'file.txt',
        size: 4,
        buffer: Buffer.from('text'),
      } as Express.Multer.File),
    ).rejects.toThrow('Only JPEG, PNG, GIF or WebP images are allowed');
    expect(imagesRepository.create).not.toHaveBeenCalled();
  });

  it('rejects uploads for a missing note', async () => {
    notesService.findOne.mockRejectedValue(
      new NotFoundException('Note not found'),
    );

    await expect(service.upload('note-id')).rejects.toThrow('Note not found');
    expect(imagesRepository.create).not.toHaveBeenCalled();
  });

  it('rejects uploads when the note already has 10 images', async () => {
    notesService.findOne.mockResolvedValue({ id: 'note-id' });
    imagesRepository.countByNoteId.mockResolvedValue(10);

    await expect(
      service.upload('note-id', {
        originalname: 'photo.jpg',
        size: 3,
        buffer: Buffer.from([0xff, 0xd8, 0xff]),
      } as Express.Multer.File),
    ).rejects.toThrow('A note can have up to 10 images');
    expect(imagesRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a missing file', async () => {
    notesService.findOne.mockResolvedValue({ id: 'note-id' });

    await expect(service.upload('note-id')).rejects.toThrow(
      'No image was uploaded',
    );
  });

  it('rejects an image that belongs to another note', async () => {
    imagesRepository.findById.mockResolvedValue(null);

    await expect(service.findOne('note-id', 'image-id')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.findOne('note-id', 'image-id')).rejects.toThrow(
      'Image not found',
    );
  });

  it('removes an image', async () => {
    const image = { id: 'image-id', noteId: 'note-id' };
    imagesRepository.findById.mockResolvedValue(image);

    await expect(
      service.remove('note-id', 'image-id'),
    ).resolves.toBeUndefined();
    expect(imagesRepository.remove).toHaveBeenCalledWith(image);
  });
});
