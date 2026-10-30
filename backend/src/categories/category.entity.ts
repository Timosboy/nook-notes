import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

export const CATEGORY_NAME_MAX_LENGTH = 40;

@Entity('categories')
@Index('UQ_categories_name', { synchronize: false })
@Check('CHK_categories_color', `"color" ~ '^#[0-9a-f]{6}$'`)
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: CATEGORY_NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: 16, default: '#787774' })
  color: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
