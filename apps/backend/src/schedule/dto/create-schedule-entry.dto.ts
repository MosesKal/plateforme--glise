import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  IsISO8601,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleEntryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  days: string[];

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime doit être au format HH:mm' })
  startTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime doit être au format HH:mm' })
  endTime: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsBoolean()
  @IsOptional()
  liveOnYoutube?: boolean;

  @IsBoolean()
  @IsOptional()
  facebookPhotosAfter?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsISO8601()
  @IsOptional()
  weekStart?: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
