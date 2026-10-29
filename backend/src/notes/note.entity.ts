import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
