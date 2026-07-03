import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tags associés à au moins un enseignement publié, avec leur nombre
   * d'enseignements — triés du plus utilisé au moins utilisé (nuage de tags).
   */
  async findAllPublic() {
    const tags = await this.prisma.teachingTag.findMany({
      where: {
        audioTeachings: {
          some: { audioTeaching: { status: 'PUBLISHED' } },
        },
      },
      include: {
        _count: {
          select: {
            audioTeachings: {
              where: { audioTeaching: { status: 'PUBLISHED' } },
            },
          },
        },
      },
    });

    return tags
      .map((tag) => ({
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        count: tag._count.audioTeachings,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
}
