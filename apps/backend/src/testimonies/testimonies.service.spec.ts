import { TestimonyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TestimoniesService } from './testimonies.service';

describe('TestimoniesService', () => {
  const testimony = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const prisma = { testimony };
  const service = new TestimoniesService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stocke une nouvelle soumission comme contenu original', async () => {
    testimony.create.mockResolvedValue({ id: 'testimony-1' });

    await service.create({
      fullName: 'Jean Kalala',
      phone: '+243 000 000 000',
      content: 'Le message reçu avec ses mots d’origine.',
    });

    expect(testimony.create).toHaveBeenCalledWith({
      data: {
        fullName: 'Jean Kalala',
        phone: '+243 000 000 000',
        originalContent: 'Le message reçu avec ses mots d’origine.',
        photoUrl: undefined,
      },
    });
  });

  it('publie la version corrigée sans exposer les versions internes', async () => {
    testimony.findMany.mockResolvedValue([
      {
        id: 'testimony-1',
        fullName: 'Jean Kalala',
        originalContent: 'Le message originale.',
        editedContent: 'Le message original.',
        photoUrl: null,
        status: TestimonyStatus.APPROVED,
        createdAt: new Date('2026-07-28T12:00:00.000Z'),
        updatedAt: new Date('2026-07-28T12:30:00.000Z'),
      },
    ]);

    const result = await service.findApproved();

    expect(result[0]).toMatchObject({
      id: 'testimony-1',
      content: 'Le message original.',
    });
    expect(result[0]).not.toHaveProperty('originalContent');
    expect(result[0]).not.toHaveProperty('editedContent');
    expect(result[0]).not.toHaveProperty('phone');
    expect(testimony.findMany).toHaveBeenCalledWith({
      where: { status: TestimonyStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        fullName: true,
        originalContent: true,
        editedContent: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('enregistre la correction sans modifier le contenu original', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-28T13:00:00.000Z'));
    testimony.findUnique.mockResolvedValue({
      id: 'testimony-1',
      originalContent: 'Le message originale.',
    });
    testimony.update.mockResolvedValue({ id: 'testimony-1' });

    await service.updateContent('testimony-1', {
      editedContent: '  Le message original.  ',
    });

    expect(testimony.update).toHaveBeenCalledWith({
      where: { id: 'testimony-1' },
      data: {
        editedContent: 'Le message original.',
        editedAt: new Date('2026-07-28T13:00:00.000Z'),
      },
    });
  });

  it('revient à l’original en supprimant seulement la correction', async () => {
    testimony.findUnique.mockResolvedValue({
      id: 'testimony-1',
      originalContent: 'Le message original.',
    });
    testimony.update.mockResolvedValue({ id: 'testimony-1' });

    await service.updateContent('testimony-1', { editedContent: null });

    expect(testimony.update).toHaveBeenCalledWith({
      where: { id: 'testimony-1' },
      data: {
        editedContent: null,
        editedAt: null,
      },
    });
  });
});
