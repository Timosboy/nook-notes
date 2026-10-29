import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from './category.entity';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';

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

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);
  }
}
