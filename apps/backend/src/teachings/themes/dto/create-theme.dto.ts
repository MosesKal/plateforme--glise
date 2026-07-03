import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  nameFr: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  descriptionFr?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
