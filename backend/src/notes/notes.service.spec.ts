import { NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';

jest.mock('./notes.repository', () => ({
  NotesRepository: class NotesRepository {},
}));

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    notesRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    service = new NotesService(notesRepository as unknown as NotesRepository);
  });

  it('returns the repository result from findAll', async () => {
    const notes = [{ id: '1', title: 'Note', content: '' }];
    notesRepository.findAll.mockResolvedValue(notes);

    await expect(service.findAll()).resolves.toBe(notes);
  });

  it('returns the repository result from findOne', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Note',
      content: '',
    };
    notesRepository.findById.mockResolvedValue(note);

    await expect(service.findOne(note.id)).resolves.toBe(note);
  });

  it('throws NotFoundException when findOne cannot find a note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.findOne('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow('Note not found');
  });

  it('passes title and content to the repository when creating', async () => {
    const note = { id: '1', title: 'Note', content: 'Text' };
    notesRepository.create.mockResolvedValue(note);

    await expect(
      service.create({ title: 'Note', content: 'Text' }),
    ).resolves.toBe(note);
    expect(notesRepository.create).toHaveBeenCalledWith({
      title: 'Note',
      content: 'Text',
    });
  });

  it('uses empty content when creating without content', async () => {
    await service.create({ title: 'Note' });

    expect(notesRepository.create).toHaveBeenCalledWith({
      title: 'Note',
      content: '',
    });
  });

  it('updates only the given fields', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Old title',
      content: 'Existing content',
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(note);

    await expect(service.update(note.id, { title: 'New title' })).resolves.toBe(
      note,
    );
    expect(note).toEqual({
      id: note.id,
      title: 'New title',
      content: 'Existing content',
    });
    expect(notesRepository.save).toHaveBeenCalledWith(note);
  });

  it('throws NotFoundException when updating a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.update('3fa85f64-5717-4562-b3fc-2c963f66afa6', {
        title: 'New title',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('removes an existing note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Note',
      content: '',
    };
    notesRepository.findById.mockResolvedValue(note);

    await expect(service.remove(note.id)).resolves.toBeUndefined();
    expect(notesRepository.remove).toHaveBeenCalledWith(note);
  });

  it('throws NotFoundException when removing a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.remove('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.remove).not.toHaveBeenCalled();
  });
});
