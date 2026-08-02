import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { AudioUploadsService } from './audio-uploads.service';

describe('AudioUploadsService', () => {
  const temporaryFiles: string[] = [];

  afterEach(async () => {
    await Promise.all(
      temporaryFiles
        .splice(0)
        .map((path) => fs.unlink(path).catch(() => undefined)),
    );
    jest.restoreAllMocks();
  });

  it('persists only server-detected metadata and returns an opaque uploadId', async () => {
    const path = join(tmpdir(), `cecj-audio-${randomUUID()}.mp3`);
    temporaryFiles.push(path);
    await fs.writeFile(path, 'valid-audio-fixture');

    type CreateAssetInput = {
      data: {
        detectedMimeType: string;
        durationSec: number;
        createdById: string;
        checksumSha256: string;
      };
    };
    const createAsset = jest.fn((input: CreateAssetInput) => {
      void input;
      return Promise.resolve({});
    });
    const prisma = {
      audioMediaAsset: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: createAsset,
      },
    };
    const mediaProbe = {
      isAvailable: jest.fn().mockReturnValue(true),
      probe: jest.fn().mockResolvedValue({
        durationSec: 42,
        bitRate: 96_000,
        format: 'mp3',
        codec: 'mp3',
        mimeType: 'audio/mpeg',
      }),
    };
    const save = jest.fn((sourcePath: string, key: string) => {
      void sourcePath;
      void key;
      return Promise.resolve();
    });
    const storage = {
      save,
      delete: jest.fn(),
    };
    const service = new AudioUploadsService(
      prisma as never,
      mediaProbe as never,
      storage as never,
    );

    const uploadId = randomUUID();
    const result = await service.stage(
      {
        path,
        originalname: 'enseignement.html',
        size: 1234,
        mimetype: 'audio/mpeg',
      } as Express.Multer.File,
      'user-1',
      uploadId,
    );

    expect(result.uploadId).toBe(uploadId);
    expect(result).toMatchObject({
      fileSize: 1234,
      mimeType: 'audio/mpeg',
      durationSec: 42,
    });
    expect(save.mock.calls[0]?.[1]).toMatch(/\.mp3$/);
    const persisted = createAsset.mock.calls[0]?.[0];
    expect(persisted?.data.detectedMimeType).toBe('audio/mpeg');
    expect(persisted?.data.durationSec).toBe(42);
    expect(persisted?.data.createdById).toBe('user-1');
    expect(persisted?.data.checksumSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rejects uploads when ffprobe is unavailable and removes the temporary file', async () => {
    const path = join(tmpdir(), `cecj-audio-${randomUUID()}.mp3`);
    temporaryFiles.push(path);
    await fs.writeFile(path, 'audio');

    const service = new AudioUploadsService(
      {} as never,
      { isAvailable: () => false } as never,
      {} as never,
    );

    await expect(
      service.stage({ path } as Express.Multer.File, 'user-1'),
    ).rejects.toMatchObject({ status: 503 });
    await expect(fs.access(path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('returns the existing staged upload when a lost response is retried', async () => {
    const path = join(tmpdir(), `cecj-audio-${randomUUID()}.mp3`);
    temporaryFiles.push(path);
    await fs.writeFile(path, 'same-retried-audio');
    const uploadId = randomUUID();
    const prisma = {
      audioMediaAsset: {
        findUnique: jest.fn().mockResolvedValue({
          id: uploadId,
          fileSize: 2048,
          detectedMimeType: 'audio/mpeg',
          durationSec: 90,
          expiresAt: new Date(Date.now() + 60_000),
          status: 'STAGED',
          createdById: 'user-1',
        }),
      },
    };
    const mediaProbe = { isAvailable: jest.fn() };
    const service = new AudioUploadsService(
      prisma as never,
      mediaProbe as never,
      {} as never,
    );

    const result = await service.stage(
      { path } as Express.Multer.File,
      'user-1',
      uploadId,
    );

    expect(result).toMatchObject({ uploadId, fileSize: 2048, durationSec: 90 });
    expect(mediaProbe.isAvailable).not.toHaveBeenCalled();
    await expect(fs.access(path)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
