import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class PagesQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;
}
