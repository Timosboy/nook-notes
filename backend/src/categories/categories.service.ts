import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from './category.entity';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findByName(dto.name);

    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }

    return this.categoriesRepository.create({
      name: dto.name,
      color: dto.color,
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name !== undefined) {
      const existing = await this.categoriesRepository.findByName(dto.name);

      if (existing && existing.id !== category.id) {
        throw new ConflictException('A category with this name already exists');
      }
    }

    return this.categoriesRepository.update(category, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.color !== undefined && { color: dto.color }),
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);
  }
}
