import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { MediaType } from '@prisma/client';

export class UpdateGalleryItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;

  @IsString()
  @IsOptional()
  albumId?: string | null;

  @IsInt()
  @IsOptional()
  order?: number;
}
