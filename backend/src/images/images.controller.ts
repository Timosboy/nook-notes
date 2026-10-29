import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { ImagesService } from './images.service';
import { ImageUploadExceptionFilter } from './image-upload-exception.filter';

@Controller('notes/:noteId/images')
@UseFilters(ImageUploadExceptionFilter)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.imagesService.upload(noteId, file);
  }

  @Get(':imageId')
  async findOne(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.imagesService.findOne(noteId, imageId);

    response
      .status(HttpStatus.OK)
      .set({
        'Content-Type': image.mimeType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
      .send(image.data);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.imagesService.remove(noteId, imageId);
  }
}
