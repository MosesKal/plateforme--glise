import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpsertRadioStationDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nameFr: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nameEn?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionFr?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionEn?: string;

  @Transform(trim)
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\//i, { message: 'streamUrl doit utiliser HTTPS' })
  @MaxLength(2048)
  streamUrl: string;

  @Transform(trim)
  @ValidateIf((_object, value) => value !== undefined && value !== '')
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\//i, { message: 'websiteUrl doit utiliser HTTPS' })
  @MaxLength(2048)
  websiteUrl?: string;

  @Transform(trim)
  @ValidateIf((_object, value) => value !== undefined && value !== '')
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\//i, { message: 'coverImage doit utiliser HTTPS' })
  @MaxLength(2048)
  coverImage?: string;

  @IsBoolean()
  isActive: boolean;
}
