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
    remove: jest.Mock;
  };

  beforeEach(() => {
    categoriesRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };
    service = new CategoriesService(
      categoriesRepository as unknown as CategoriesRepository,
    );
  });

  it('lists categories', async () => {
    const categories = [{ id: '1', name: 'Work', color: 'blue' }];
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
    const category = { id: '1', name: 'Work', color: 'blue' };
    categoriesRepository.findByName.mockResolvedValue(null);
    categoriesRepository.create.mockResolvedValue(category);

    await expect(service.create({ name: 'Work', color: 'blue' })).resolves.toBe(
      category,
    );
    expect(categoriesRepository.create).toHaveBeenCalledWith({
      name: 'Work',
      color: 'blue',
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

  it('throws NotFoundException when removing a missing category', async () => {
    categoriesRepository.findById.mockResolvedValue(null);

    await expect(
      service.remove('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
    ).rejects.toThrow(NotFoundException);
    expect(categoriesRepository.remove).not.toHaveBeenCalled();
  });
});
