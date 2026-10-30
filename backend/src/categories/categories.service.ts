import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Category } from './category.entity';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findAll(userId);
  }

  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(userId, id);

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findByName(
      userId,
      dto.name,
    );

    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }

    return this.categoriesRepository
      .create({
        userId,
        name: dto.name,
        color: dto.color,
      })
      .catch(categoryConflict);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(userId, id);

    if (dto.name !== undefined) {
      const existing = await this.categoriesRepository.findByName(
        userId,
        dto.name,
      );

      if (existing && existing.id !== category.id) {
        throw new ConflictException('A category with this name already exists');
      }
    }

    return this.categoriesRepository
      .update(category, {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      })
      .catch(categoryConflict);
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOne(userId, id);

    await this.categoriesRepository.remove(category);
  }
}

function categoryConflict(error: unknown): never {
  if (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string; constraint?: string }).code ===
      '23505' &&
    (error.driverError as { constraint?: string }).constraint ===
      'UQ_categories_name'
  ) {
    throw new ConflictException('A category with this name already exists');
  }
  throw error;
}
