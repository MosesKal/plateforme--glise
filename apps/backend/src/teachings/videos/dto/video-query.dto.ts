import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TeachingStatusDto } from '../../audio/dto/create-audio-teaching.dto';

export class PublicVideoQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  themeSlug?: string;

  @IsString()
  @IsOptional()
  speakerSlug?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class AdminVideoQueryDto extends PaginationDto {
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
