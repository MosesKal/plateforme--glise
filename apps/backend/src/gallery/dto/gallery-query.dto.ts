import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GalleryQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  albumId?: string;

  @IsString()
  @IsOptional()
  mediaType?: string;
}
