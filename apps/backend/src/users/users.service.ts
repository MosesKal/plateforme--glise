import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, roleId?: string, status?: string) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      ...(roleId ? { roleId } : {}),
      ...(status ? { status: status as any } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) throw new NotFoundException('Role not found');

    const hashed = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        roleId: dto.roleId,
        status: dto.status,
      },
      select: USER_SELECT,
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: { id: string; role: { name: string } },
  ) {
    await this.findOne(id);

    // L'identité de connexion (email, mot de passe) est réservée au Super Admin.
    if (
      (dto.email || dto.password) &&
      currentUser.role.name !== 'Super Admin'
    ) {
      throw new ForbiddenException(
        'Only Super Admin can change email or password',
      );
    }

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });
      if (!role) throw new NotFoundException('Role not found');
    }

    if (dto.email) {
      const conflict = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (conflict) throw new ConflictException('Email already in use');
    }

    const { password, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });

    // Un mot de passe changé par l'admin invalide toutes les sessions de la
    // cible : ses refresh tokens sont révoqués, elle devra se reconnecter.
    if (password) {
      await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    }

    return user;
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ConflictException('Cannot delete your own account');
    }
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id }, select: USER_SELECT });
  }
}
