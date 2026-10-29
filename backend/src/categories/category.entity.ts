import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const CATEGORY_NAME_MAX_LENGTH = 40;

@Entity('categories')
@Index('UQ_categories_name', { synchronize: false })
@Check('CHK_categories_color', `"color" ~ '^#[0-9a-f]{6}$'`)
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: CATEGORY_NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: 16, default: '#787774' })
  color: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
