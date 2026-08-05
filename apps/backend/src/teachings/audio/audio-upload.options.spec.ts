import {
  Controller,
  INestApplication,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { memoryStorage } from 'multer';
import request from 'supertest';
import { audioUploadOptions } from './audio-upload.options';

const testAudioUploadOptions = {
  ...audioUploadOptions,
  storage: memoryStorage(),
};

@Controller('audio-upload-test')
class AudioUploadTestController {
  @Post()
  @UseInterceptors(FileInterceptor('file', testAudioUploadOptions))
  upload(@UploadedFile() file: Express.Multer.File | undefined) {
    return { filename: file?.originalname, size: file?.size };
  }
}

describe('audioUploadOptions', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AudioUploadTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a multipart body containing exactly one audio file', async () => {
    await request(app.getHttpServer())
      .post('/audio-upload-test')
      .attach('file', Buffer.from('audio-fixture'), {
        filename: 'enseignement.mp3',
        contentType: 'audio/mpeg',
      })
      .expect(201)
      .expect({ filename: 'enseignement.mp3', size: 13 });
  });
});
