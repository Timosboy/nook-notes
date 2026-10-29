import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';

jest.mock('./categories.repository', () => ({
  CategoriesRepository: class CategoriesRepository {},
}));

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByName: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    categoriesRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    service = new CategoriesService(
      categoriesRepository as unknown as CategoriesRepository,
    );
  });

  it('lists categories', async () => {
    const categories = [{ id: '1', name: 'Work', color: '#337ea9' }];
    categoriesRepository.findAll.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toBe(categories);
  });

  it('throws NotFoundException when findOne cannot find a category', async () => {
    categoriesRepository.findById.mockResolvedValue(null);

    await expect(
      service.findOne('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.findOne('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow('Category not found');
  });

  it('creates a category when its name is available', async () => {
    const category = { id: '1', name: 'Work', color: '#337ea9' };
    categoriesRepository.findByName.mockResolvedValue(null);
    categoriesRepository.create.mockResolvedValue(category);

    await expect(
      service.create({ name: 'Work', color: '#337ea9' }),
    ).resolves.toBe(category);
    expect(categoriesRepository.create).toHaveBeenCalledWith({
      name: 'Work',
      color: '#337ea9',
    });
  });

  it('throws ConflictException when creating a duplicate category', async () => {
    categoriesRepository.findByName.mockResolvedValue({
      id: '1',
      name: 'Work',
    });

    await expect(service.create({ name: 'Work' })).rejects.toThrow(
      ConflictException,
    );
    await expect(service.create({ name: 'Work' })).rejects.toThrow(
      'A category with this name already exists',
    );
    expect(categoriesRepository.create).not.toHaveBeenCalled();
  });

  it('removes an existing category', async () => {
    const category = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Work',
    };
    categoriesRepository.findById.mockResolvedValue(category);

    await expect(service.remove(category.id)).resolves.toBeUndefined();
    expect(categoriesRepository.remove).toHaveBeenCalledWith(category);
  });

  it('renames a category', async () => {
    const category = { id: '1', name: 'Work', color: '#337ea9' };
    const renamed = { ...category, name: 'Projects' };
    categoriesRepository.findById.mockResolvedValue(category);
    categoriesRepository.findByName.mockResolvedValue(null);
    categoriesRepository.update.mockResolvedValue(renamed);

    await expect(service.update('1', { name: 'Projects' })).resolves.toBe(
      renamed,
    );
    expect(categoriesRepository.update).toHaveBeenCalledWith(category, {
      name: 'Projects',
    });
  });

  it('recolors a category', async () => {
    const category = { id: '1', name: 'Work', color: '#337ea9' };
    const recolored = { ...category, color: '#d44c47' };
    categoriesRepository.findById.mockResolvedValue(category);
    categoriesRepository.update.mockResolvedValue(recolored);

    await expect(service.update('1', { color: '#d44c47' })).resolves.toBe(
      recolored,
    );
    expect(categoriesRepository.update).toHaveBeenCalledWith(category, {
      color: '#d44c47',
    });
  });

  it('allows changing the case of a category name', async () => {
    const category = { id: '1', name: 'Work', color: '#337ea9' };
    categoriesRepository.findById.mockResolvedValue(category);
    categoriesRepository.findByName.mockResolvedValue(category);
    categoriesRepository.update.mockResolvedValue({
      ...category,
      name: 'WORK',
    });

    await expect(service.update('1', { name: 'WORK' })).resolves.toMatchObject({
      name: 'WORK',
    });
  });

  it('rejects renaming to another category name', async () => {
    categoriesRepository.findById.mockResolvedValue({ id: '1', name: 'Work' });
    categoriesRepository.findByName.mockResolvedValue({
      id: '2',
      name: 'Home',
    });

    await expect(service.update('1', { name: 'Home' })).rejects.toThrow(
      ConflictException,
    );
    await expect(service.update('1', { name: 'Home' })).rejects.toThrow(
      'A category with this name already exists',
    );
    expect(categoriesRepository.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when updating a missing category', async () => {
    categoriesRepository.findById.mockResolvedValue(null);

    await expect(
      service.update('missing', { color: '#d44c47' }),
    ).rejects.toThrow('Category not found');
    expect(categoriesRepository.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when removing a missing category', async () => {
    categoriesRepository.findById.mockResolvedValue(null);

    await expect(
      service.remove('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow(NotFoundException);
    expect(categoriesRepository.remove).not.toHaveBeenCalled();
  });
});
