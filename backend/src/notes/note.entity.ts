import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { NoteImage } from '../images/note-image.entity';

export const TITLE_MAX_LENGTH = 120;

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: TITLE_MAX_LENGTH })
  title: string;

  @Column({ type: 'text', default: '' })
  content: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  emoji: string | null;

  @Index()
  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  pinned: boolean;

  @ManyToMany(() => Category, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'note_categories',
    joinColumn: { name: 'noteId' },
    inverseJoinColumn: { name: 'categoryId' },
  })
  categories: Category[];

  @OneToMany(() => NoteImage, (image) => image.note)
  images: NoteImage[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
