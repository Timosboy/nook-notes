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
  };

  beforeEach(() => {
    notesRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
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
});
