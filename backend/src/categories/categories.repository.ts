import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

export type NewCategory = Pick<Category, 'name'> &
  Partial<Pick<Category, 'color'>>;

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categories.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Category | null> {
    return this.categories.findOneBy({ id });
  }

  findByName(name: string): Promise<Category | null> {
    return this.categories
      .createQueryBuilder('category')
      .where('LOWER(category.name) = LOWER(:name)', { name })
      .getOne();
  }

  create(category: NewCategory): Promise<Category> {
    return this.categories.save(this.categories.create(category));
  }

  async remove(category: Category): Promise<void> {
    await this.categories.remove(category);
  }
}
