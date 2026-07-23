import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventStatus } from '@prisma/client';
import { EVENT_CATEGORIES, type EventCategory } from '@cecj/shared';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  titleFr: string;

  @IsString()
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  descriptionFr?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsIn(EVENT_CATEGORIES)
  category: EventCategory;

  @IsString()
  @IsOptional()
  speaker?: string;

  @IsString()
  @IsOptional()
  organizer?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
