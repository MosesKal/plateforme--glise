import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSermonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  speaker?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @IsString()
  @IsOptional()
  publishedAt?: string | null;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
