import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export enum TeachingStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Le fichier est uploadé au préalable via POST /teachings/audio/upload qui
 * renvoie fileKey/fileSize/mimeType/durationSec — repris tels quels ici.
 * Le pattern strict sur fileKey neutralise toute traversée de chemin.
 */
export class CreateAudioTeachingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  themeId: string;

  @IsString()
  @IsNotEmpty()
  speakerId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  preachedAt?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(TeachingStatusDto)
  @IsOptional()
  status?: TeachingStatusDto;

  @Matches(/^audio\/\d{4}\/[a-z0-9][a-z0-9-]*\.[a-z0-9]+$/i, {
    message: 'fileKey invalide',
  })
  @IsOptional()
  fileKey?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSec?: number;
}
