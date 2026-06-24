import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class EventsQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  upcoming?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
