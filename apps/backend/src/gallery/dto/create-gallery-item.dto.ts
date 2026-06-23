import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateGalleryItemDto {
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;

  @IsString()
  @IsOptional()
  albumId?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
