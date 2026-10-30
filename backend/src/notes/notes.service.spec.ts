import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';

jest.mock('./notes.repository', () => ({
  NotesRepository: class NotesRepository {},
}));

jest.mock('../categories/categories.service', () => ({
  CategoriesService: class CategoriesService {},
}));

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    setPinned: jest.Mock;
    remove: jest.Mock;
  };
  let categoriesService: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    notesRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      setPinned: jest.fn(),
      remove: jest.fn(),
    };
    categoriesService = {
      findOne: jest.fn(),
    };
    service = new NotesService(
      notesRepository as unknown as NotesRepository,
      categoriesService as unknown as CategoriesService,
    );
  });

  it('lists active notes by default', async () => {
    const notes = [{ id: '1', title: 'Note', userId: 'user-id', content: '' }];
    notesRepository.findAll.mockResolvedValue(notes);

    await expect(service.findAll('user-id')).resolves.toBe(notes);
    expect(notesRepository.findAll).toHaveBeenCalledWith(
      'user-id',
      false,
      undefined,
    );
  });

  it('passes true when listing archived notes', async () => {
    const notes = [{ id: '1', title: 'Note', userId: 'user-id', content: '' }];
    notesRepository.findAll.mockResolvedValue(notes);

    await expect(service.findAll('user-id', true)).resolves.toBe(notes);
    expect(notesRepository.findAll).toHaveBeenCalledWith(
      'user-id',
      true,
      undefined,
    );
  });

  it('passes the category when listing notes', async () => {
    const notes = [{ id: '1', title: 'Note', userId: 'user-id', content: '' }];
    const categoryId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    notesRepository.findAll.mockResolvedValue(notes);

    await expect(service.findAll('user-id', false, categoryId)).resolves.toBe(
      notes,
    );
    expect(notesRepository.findAll).toHaveBeenCalledWith(
      'user-id',
      false,
      categoryId,
    );
  });

  it('returns the repository result from findOne', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
    };
    notesRepository.findById.mockResolvedValue(note);

    await expect(service.findOne('user-id', note.id)).resolves.toBe(note);
  });

  it('throws NotFoundException when findOne cannot find a note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.findOne('user-id', '3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow('Note not found');
  });

  it('treats another user note as missing', async () => {
    notesRepository.findById.mockResolvedValue({
      id: 'note-id',
      userId: 'other-user',
    });

    await expect(service.findOne('user-id', 'note-id')).rejects.toThrow(
      'Note not found',
    );
    await expect(
      service.update('user-id', 'note-id', { title: 'Changed' }),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.findById).toHaveBeenCalledWith('user-id', 'note-id');
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('rejects adding another user category', async () => {
    notesRepository.findById.mockResolvedValue({
      id: 'note-id',
      userId: 'user-id',
      categories: [],
    });
    categoriesService.findOne.mockRejectedValue(
      new NotFoundException('Category not found'),
    );

    await expect(
      service.addCategory('user-id', 'note-id', 'other-category'),
    ).rejects.toThrow('Category not found');
    expect(categoriesService.findOne).toHaveBeenCalledWith(
      'user-id',
      'other-category',
    );
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('passes title and content to the repository when creating', async () => {
    const note = { id: '1', title: 'Note', userId: 'user-id', content: 'Text' };
    notesRepository.create.mockResolvedValue(note);

    await expect(
      service.create('user-id', { title: 'Note', content: 'Text' }),
    ).resolves.toBe(note);
    expect(notesRepository.create).toHaveBeenCalledWith({
      userId: 'user-id',
      title: 'Note',
      content: 'Text',
      emoji: null,
    });
  });

  it('uses empty content when creating without content', async () => {
    await service.create('user-id', { title: 'Note' });

    expect(notesRepository.create).toHaveBeenCalledWith({
      userId: 'user-id',
      title: 'Note',
      content: '',
      emoji: null,
    });
  });

  it('creates a note with an emoji', async () => {
    const note = {
      id: '1',
      title: 'Note',
      content: '',
      userId: 'user-id',
      emoji: '🚀',
    };
    notesRepository.create.mockResolvedValue(note);

    await expect(
      service.create('user-id', { title: 'Note', emoji: '🚀' }),
    ).resolves.toBe(note);
    expect(notesRepository.create).toHaveBeenCalledWith({
      userId: 'user-id',
      title: 'Note',
      content: '',
      emoji: '🚀',
    });
  });

  it('updates only the given fields', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Old title',
      content: 'Existing content',
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(note);

    await expect(
      service.update('user-id', note.id, { title: 'New title' }),
    ).resolves.toBe(note);
    expect(note).toEqual({
      id: note.id,
      userId: 'user-id',
      title: 'New title',
      content: 'Existing content',
    });
    expect(notesRepository.save).toHaveBeenCalledWith(note);
  });

  it('throws NotFoundException when updating a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.update('user-id', '3fa85f64-5717-4562-b3fc-2c963f66afa6', {
        title: 'New title',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('changes and clears a note emoji', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      emoji: '🚀',
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(note);

    await service.update('user-id', note.id, { emoji: '🌿' });
    expect(note.emoji).toBe('🌿');

    await service.update('user-id', note.id, { emoji: null });
    expect(note.emoji).toBeNull();
    expect(notesRepository.save).toHaveBeenCalledTimes(2);
  });

  it('archives an existing note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      archived: false,
      pinned: true,
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(note);

    await expect(service.archive('user-id', note.id)).resolves.toBe(note);
    expect(note.archived).toBe(true);
    expect(note.pinned).toBe(false);
    expect(notesRepository.save).toHaveBeenCalledWith(note);
  });

  it('unarchives an existing note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      archived: true,
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(note);

    await expect(service.unarchive('user-id', note.id)).resolves.toBe(note);
    expect(note.archived).toBe(false);
    expect(notesRepository.save).toHaveBeenCalledWith(note);
  });

  it('throws NotFoundException when archiving a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.archive('user-id', '3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('pins an active note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      archived: false,
      pinned: true,
    };
    notesRepository.findById.mockResolvedValueOnce({ ...note, pinned: false });
    notesRepository.setPinned.mockResolvedValue(note);

    await expect(service.pin('user-id', note.id)).resolves.toBe(note);
    expect(notesRepository.setPinned).toHaveBeenCalledWith(
      'user-id',
      note.id,
      true,
    );
  });

  it('unpins a note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      archived: false,
      pinned: false,
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.setPinned.mockResolvedValue(note);

    await expect(service.unpin('user-id', note.id)).resolves.toBe(note);
    expect(notesRepository.setPinned).toHaveBeenCalledWith(
      'user-id',
      note.id,
      false,
    );
  });

  it('rejects pinning an archived note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      archived: true,
      pinned: false,
    };
    notesRepository.findById.mockResolvedValue(note);

    await expect(service.pin('user-id', note.id)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.pin('user-id', note.id)).rejects.toThrow(
      'Archived notes cannot be pinned',
    );
    expect(notesRepository.setPinned).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when pinning a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.pin('user-id', '3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow('Note not found');
    expect(notesRepository.setPinned).not.toHaveBeenCalled();
  });

  it('adds a category to a note', async () => {
    const category = { id: 'category-id', userId: 'user-id', name: 'Work' };
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      categories: [],
    };
    notesRepository.findById.mockResolvedValue(note);
    categoriesService.findOne.mockResolvedValue(category);
    notesRepository.save.mockResolvedValue(note);

    await expect(
      service.addCategory('user-id', note.id, category.id),
    ).resolves.toBe(note);
    expect(note.categories).toEqual([category]);
    expect(notesRepository.save).toHaveBeenCalledWith(note);
  });

  it('does not duplicate or save an existing category', async () => {
    const category = { id: 'category-id', userId: 'user-id', name: 'Work' };
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      categories: [category],
    };
    notesRepository.findById.mockResolvedValue(note);
    categoriesService.findOne.mockResolvedValue(category);

    await expect(
      service.addCategory('user-id', note.id, category.id),
    ).resolves.toBe(note);
    expect(note.categories).toEqual([category]);
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('removes a category from a note', async () => {
    const category = { id: 'category-id', userId: 'user-id', name: 'Work' };
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      categories: [category],
    };
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(note);

    await expect(
      service.removeCategory('user-id', note.id, category.id),
    ).resolves.toBe(note);
    expect(note.categories).toEqual([]);
    expect(notesRepository.save).toHaveBeenCalledWith(note);
  });

  it('throws NotFoundException when adding a category to a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.addCategory(
        'user-id',
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        'category-id',
      ),
    ).rejects.toThrow(NotFoundException);
    expect(categoriesService.findOne).not.toHaveBeenCalled();
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when adding a missing category', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
      categories: [],
    };
    notesRepository.findById.mockResolvedValue(note);
    categoriesService.findOne.mockRejectedValue(
      new NotFoundException('Category not found'),
    );

    await expect(
      service.addCategory('user-id', note.id, 'category-id'),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.save).not.toHaveBeenCalled();
  });

  it('removes an existing note', async () => {
    const note = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: 'user-id',
      title: 'Note',
      content: '',
    };
    notesRepository.findById.mockResolvedValue(note);

    await expect(service.remove('user-id', note.id)).resolves.toBeUndefined();
    expect(notesRepository.remove).toHaveBeenCalledWith(note);
  });

  it('throws NotFoundException when removing a missing note', async () => {
    notesRepository.findById.mockResolvedValue(null);

    await expect(
      service.remove('user-id', '3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow(NotFoundException);
    expect(notesRepository.remove).not.toHaveBeenCalled();
  });
});
