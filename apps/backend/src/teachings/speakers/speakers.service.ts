import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ensureUniqueSlug } from '../common/slug.util';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Injectable()
export class SpeakersService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.speaker.findMany({
      where: { isActive: true },
      orderBy: { fullName: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.speaker.findMany({
      orderBy: { fullName: 'asc' },
      include: { _count: { select: { audioTeachings: true } } },
    });
  }

  async create(dto: CreateSpeakerDto) {
    const slug = await ensureUniqueSlug(dto.fullName, async (candidate) =>
      Boolean(
        await this.prisma.speaker.findUnique({
          where: { slug: candidate },
          select: { id: true },
        }),
      ),
    );
    return this.prisma.speaker.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateSpeakerDto) {
    await this.ensureExists(id);
    return this.prisma.speaker.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      include: { _count: { select: { audioTeachings: true } } },
    });
    if (!speaker) throw new NotFoundException('Orateur introuvable');

    if (speaker._count.audioTeachings > 0) {
      throw new ConflictException(
        `Cet orateur est associé à ${speaker._count.audioTeachings} enseignement(s). ` +
          'Réaffectez-les avant de le supprimer.',
      );
    }
    return this.prisma.speaker.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!speaker) throw new NotFoundException('Orateur introuvable');
  }
}
