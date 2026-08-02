import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum TeachingStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Le fichier est uploadé au préalable via POST /teachings/audio/upload.
 * Seul l'identifiant opaque est accepté : taille, MIME, durée et clé de
 * stockage restent exclusivement sous le contrôle du serveur.
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

  @IsUUID('4')
  @IsOptional()
  uploadId?: string;
}
