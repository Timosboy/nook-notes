import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Note } from '../notes/note.entity';

@Entity('note_images')
export class NoteImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  noteId: string;

  @ManyToOne(() => Note, (note) => note.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'noteId' })
  note: Note;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 50 })
  mimeType: string;

  @Column('int')
  size: number;

  @Column({ type: 'bytea', select: false })
  data: Buffer;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
