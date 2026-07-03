import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ensureUniqueSlug } from '../common/slug.util';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  /** Thèmes actifs avec le nombre d'enseignements publiés (site public). */
  findAllPublic() {
    return this.prisma.teachingTheme.findMany({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }, { nameFr: 'asc' }],
      include: {
        _count: {
          select: {
            audioTeachings: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });
  }

  /** Tous les thèmes, y compris inactifs, avec compte total (backoffice). */
  findAllAdmin() {
    return this.prisma.teachingTheme.findMany({
      orderBy: [{ position: 'asc' }, { nameFr: 'asc' }],
      include: { _count: { select: { audioTeachings: true } } },
    });
  }

  async findBySlug(slug: string) {
    const theme = await this.prisma.teachingTheme.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            audioTeachings: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });
    if (!theme || !theme.isActive) {
      throw new NotFoundException('Thème introuvable');
    }
    return theme;
  }

  async create(dto: CreateThemeDto) {
    const slug = await ensureUniqueSlug(dto.nameFr, async (candidate) =>
      Boolean(
        await this.prisma.teachingTheme.findUnique({
          where: { slug: candidate },
          select: { id: true },
        }),
      ),
    );
    return this.prisma.teachingTheme.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateThemeDto) {
    await this.ensureExists(id);
    return this.prisma.teachingTheme.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const theme = await this.prisma.teachingTheme.findUnique({
      where: { id },
      include: { _count: { select: { audioTeachings: true } } },
    });
    if (!theme) throw new NotFoundException('Thème introuvable');

    // La FK est en RESTRICT : on refuse explicitement avec un message actionnable
    // plutôt que de laisser remonter une erreur Prisma P2003 opaque.
    if (theme._count.audioTeachings > 0) {
      throw new ConflictException(
        `Ce thème contient ${theme._count.audioTeachings} enseignement(s). ` +
          'Réaffectez-les à un autre thème avant de le supprimer.',
      );
    }
    return this.prisma.teachingTheme.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const theme = await this.prisma.teachingTheme.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!theme) throw new NotFoundException('Thème introuvable');
  }
}
