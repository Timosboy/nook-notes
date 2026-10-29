import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const CATEGORY_NAME_MAX_LENGTH = 40;

export const CATEGORY_COLORS = [
  'gray',
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

const colorList = CATEGORY_COLORS.map((color) => `'${color}'`).join(', ');

@Entity('categories')
@Index('UQ_categories_name', { synchronize: false })
@Check('CHK_categories_color', `"color" IN (${colorList})`)
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: CATEGORY_NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: 16, default: 'gray' })
  color: CategoryColor;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
