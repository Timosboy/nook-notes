import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from '../notes/notes.module';
import { ImagesController } from './images.controller';
import { ImagesRepository } from './images.repository';
import { ImagesService } from './images.service';
import { NoteImage } from './note-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteImage]), NotesModule],
  controllers: [ImagesController],
  providers: [ImagesRepository, ImagesService],
})
export class ImagesModule {}
