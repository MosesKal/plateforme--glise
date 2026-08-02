import { AudioTeachingsService } from './audio-teachings.service';

describe('AudioTeachingsService upload safety', () => {
  function createService(overrides?: {
    prisma?: object;
    uploads?: object;
    transcode?: object;
    storage?: object;
  }) {
    return new AudioTeachingsService(
      (overrides?.prisma ?? {}) as never,
      (overrides?.uploads ?? {}) as never,
      (overrides?.transcode ?? {}) as never,
      (overrides?.storage ?? {}) as never,
    );
  }

  it('canonicalizes and de-duplicates tags by slug', () => {
    const service = createService();
    const privateService = service as unknown as {
      buildTagsCreate(tags: string[]): {
        create: Array<{
          tag: { connectOrCreate: { where: { slug: string } } };
        }>;
      };
    };

    const result = privateService.buildTagsCreate(['foi', 'Foi', 'Foi !']);

    expect(result.create).toHaveLength(1);
    expect(result.create[0].tag.connectOrCreate.where).toEqual({ slug: 'foi' });
  });

  it('never deletes the previous file before the database replacement commits', async () => {
    const databaseError = new Error('database unavailable');
    const tx = {
      audioTeaching: { update: jest.fn().mockRejectedValue(databaseError) },
    };
    const prisma = {
      audioTeaching: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'teaching-1',
          fileKey: 'audio/2026/old.mp3',
          mediaAssetId: 'old-asset',
          mediaAsset: { id: 'old-asset', status: 'READY' },
        }),
      },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        Promise.resolve(callback(tx)),
      ),
    };
    const claim = {
      asset: {
        id: '11111111-1111-4111-8111-111111111111',
        fileSize: 100,
        durationSec: 10,
        detectedMimeType: 'audio/mpeg',
      },
      finalKey: 'audio/2026/new.mp3',
    };
    const uploads = {
      findAttachedTeaching: jest.fn().mockResolvedValue(null),
      claimForPromotion: jest.fn().mockResolvedValue(claim),
      promote: jest.fn().mockResolvedValue(undefined),
      rollbackPromotion: jest.fn().mockResolvedValue(undefined),
    };
    const storage = { delete: jest.fn() };
    const service = createService({ prisma, uploads, storage });

    await expect(
      service.update('teaching-1', { uploadId: claim.asset.id }, 'user-1'),
    ).rejects.toThrow('database unavailable');

    expect(uploads.promote).toHaveBeenCalled();
    expect(uploads.rollbackPromotion).toHaveBeenCalledWith(
      claim,
      databaseError,
    );
    expect(storage.delete).not.toHaveBeenCalled();
  });
});
