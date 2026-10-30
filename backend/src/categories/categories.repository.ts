import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

export type NewCategory = Pick<Category, 'userId' | 'name'> &
  Partial<Pick<Category, 'color'>>;

export type CategoryChanges = Partial<Pick<Category, 'name' | 'color'>>;

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(userId: string): Promise<Category[]> {
    return this.categories.find({ where: { userId }, order: { name: 'ASC' } });
  }

  findById(userId: string, id: string): Promise<Category | null> {
    return this.categories.findOneBy({ id, userId });
  }

  findByName(userId: string, name: string): Promise<Category | null> {
    return this.categories
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .andWhere('LOWER(category.name) = LOWER(:name)', { name })
      .getOne();
  }

  create(category: NewCategory): Promise<Category> {
    return this.categories.save(this.categories.create(category));
  }

  update(category: Category, changes: CategoryChanges): Promise<Category> {
    return this.categories.save({ ...category, ...changes });
  }

  async remove(category: Category): Promise<void> {
    await this.categories.remove(category);
  }
}
