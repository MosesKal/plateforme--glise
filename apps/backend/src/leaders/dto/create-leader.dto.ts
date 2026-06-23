import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaderRole } from '@prisma/client';

export class CreateLeaderDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(LeaderRole)
  @IsOptional()
  role?: LeaderRole;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
