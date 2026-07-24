import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRadioStationDto } from './dto/upsert-radio-station.dto';
import { RadioService } from './radio.service';

const validDto: UpsertRadioStationDto = {
  nameFr: 'Radio CECJC',
  nameEn: 'CECJC Radio',
  descriptionFr: 'La radio de la paroisse',
  descriptionEn: 'The church radio',
  streamUrl: 'https://stream.zeno.fm/t2utmgpt1m6tv',
  websiteUrl: undefined,
  coverImage: undefined,
  isActive: true,
};

describe('RadioService', () => {
  const radioStation = {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };
  const prisma = {
    radioStation,
    $transaction: jest.fn(
      (callback: (tx: { radioStation: typeof radioStation }) => unknown) =>
        callback({ radioStation }),
    ),
  };
  const config = {
    get: jest.fn((_key: string, fallback: string) => fallback),
  };
  const service = new RadioService(
    prisma as unknown as PrismaService,
    config as unknown as ConfigService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retourne uniquement la radio active avec les champs publics', async () => {
    radioStation.findFirst.mockResolvedValue({ id: 'radio-1' });

    await service.findPublic();

    expect(radioStation.findFirst).toHaveBeenCalledWith({
      where: { isActive: true },
      select: expect.objectContaining({
        id: true,
        streamUrl: true,
        nameFr: true,
      }),
    });
    const options = radioStation.findFirst.mock.calls[0][0];
    expect(options.select).not.toHaveProperty('isActive');
    expect(options.select).not.toHaveProperty('createdAt');
    expect(options.select).not.toHaveProperty('updatedAt');
  });

  it('crée la configuration et désactive toute autre radio avant activation', async () => {
    radioStation.findFirst.mockResolvedValue(null);
    radioStation.updateMany.mockResolvedValue({ count: 1 });
    radioStation.create.mockResolvedValue({ id: 'radio-1', ...validDto });

    await service.upsert(validDto);

    expect(radioStation.updateMany).toHaveBeenCalledWith({
      where: { isActive: true },
      data: { isActive: false },
    });
    expect(radioStation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        streamUrl: validDto.streamUrl,
        isActive: true,
      }),
    });
  });

  it('met à jour la configuration singleton existante', async () => {
    radioStation.findFirst.mockResolvedValue({ id: 'radio-1' });
    radioStation.updateMany.mockResolvedValue({ count: 0 });
    radioStation.update.mockResolvedValue({ id: 'radio-1', ...validDto });

    await service.upsert(validDto);

    expect(radioStation.update).toHaveBeenCalledWith({
      where: { id: 'radio-1' },
      data: expect.objectContaining({ nameFr: 'Radio CECJC' }),
    });
    expect(radioStation.create).not.toHaveBeenCalled();
  });

  it('refuse un domaine non présent dans l’allowlist SSRF', async () => {
    await expect(
      service.upsert({
        ...validDto,
        streamUrl: 'https://example.com/private-stream',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('UpsertRadioStationDto', () => {
  it('accepte le flux public HTTPS Zeno', async () => {
    const dto = plainToInstance(UpsertRadioStationDto, validDto);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('refuse une URL de flux HTTP', async () => {
    const dto = plainToInstance(UpsertRadioStationDto, {
      ...validDto,
      streamUrl: 'http://stream.zeno.fm/t2utmgpt1m6tv',
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'streamUrl')).toBe(true);
  });
});
