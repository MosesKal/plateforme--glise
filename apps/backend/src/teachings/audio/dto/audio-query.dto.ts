import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TeachingStatusDto } from './create-audio-teaching.dto';

export class PublicAudioQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  themeSlug?: string;

  @IsString()
  @IsOptional()
  speakerSlug?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsIn(['recent', 'popular'])
  @IsOptional()
  sort?: 'recent' | 'popular';
}

export class AdminAudioQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  themeId?: string;

  @IsEnum(TeachingStatusDto)
  @IsOptional()
  status?: TeachingStatusDto;

  @IsString()
  @IsOptional()
  search?: string;
}
