import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';

jest.mock('./notes.repository', () => ({
  NotesRepository: class NotesRepository {},
}));

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: {
    findAll: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    notesRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
    };
    service = new NotesService(notesRepository as unknown as NotesRepository);
  });

  it('returns the repository result from findAll', async () => {
    const notes = [{ id: '1', title: 'Note', content: '' }];
    notesRepository.findAll.mockResolvedValue(notes);

    await expect(service.findAll()).resolves.toBe(notes);
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
