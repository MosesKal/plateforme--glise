import { AudioTranscodeService } from './audio-transcode.service';

describe('AudioTranscodeService durable leases', () => {
  it('marks an expired final attempt as FAILED instead of leaving it PROCESSING', async () => {
    type AssetUpdateInput = {
      data: { status?: string; leaseId?: null; leaseExpiresAt?: null };
    };
    type TeachingUpdateInput = { data: { processing?: string } };

    const assetUpdateMany = jest.fn((input: AssetUpdateInput) => {
      void input;
      return Promise.resolve({ count: 1 });
    });
    const teachingUpdateMany = jest.fn((input: TeachingUpdateInput) => {
      void input;
      return Promise.resolve({ count: 1 });
    });
    const tx = {
      audioMediaAsset: { updateMany: assetUpdateMany },
      audioTeaching: { updateMany: teachingUpdateMany },
    };
    const transaction = jest.fn(
      (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    );
    let findCall = 0;
    const findMany = jest.fn((input: unknown) => {
      void input;
      findCall += 1;
      return Promise.resolve(
        findCall === 1
          ? [
              {
                id: 'asset-1',
                leaseId: 'expired-lease',
                teaching: { id: 'teaching-1' },
              },
            ]
          : [],
      );
    });
    const prisma = {
      audioMediaAsset: { findMany },
      $transaction: transaction,
    };
    const service = new AudioTranscodeService(
      prisma as never,
      {} as never,
      {} as never,
    );

    await service.recoverRunnableJobs();

    expect(assetUpdateMany.mock.calls[0]?.[0].data.status).toBe('FAILED');
    expect(assetUpdateMany.mock.calls[0]?.[0].data.leaseId).toBeNull();
    expect(teachingUpdateMany.mock.calls[0]?.[0].data.processing).toBe(
      'FAILED',
    );
  });
});
