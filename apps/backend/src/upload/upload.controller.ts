import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    const baseUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
    const url = `${baseUrl}/uploads/${file.filename}`;

    return { url, filename: file.filename, size: file.size, mimetype: file.mimetype };
  }
}
