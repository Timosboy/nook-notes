import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

export const TITLE_MAX_LENGTH = 120;

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: TITLE_MAX_LENGTH })
  title: string;

  @Column({ type: 'text', default: '' })
  content: string;

  @Index()
  @Column({ default: false })
  archived: boolean;

  @ManyToMany(() => Category, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'note_categories',
    joinColumn: { name: 'noteId' },
    inverseJoinColumn: { name: 'categoryId' },
  })
  categories: Category[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
