import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSermonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  speaker: string;

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
  categoryId?: string;

  @IsString()
  @IsOptional()
  publishedAt?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
