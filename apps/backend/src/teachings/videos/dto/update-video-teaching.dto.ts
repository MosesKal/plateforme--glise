import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TeachingStatusDto } from '../../audio/dto/create-audio-teaching.dto';

/**
 * Seuls les champs ÉDITORIAUX sont modifiables : les métadonnées YouTube
 * (titre, description, vignette, durée…) sont réécrites à chaque sync et
 * n'apparaissent volontairement pas ici.
 */
export class UpdateVideoTeachingDto {
  @IsEnum(TeachingStatusDto)
  @IsOptional()
  status?: TeachingStatusDto;

  // null = retirer le thème/orateur ; les IsString ignorent null via IsOptional + validation manuelle service
  @IsString()
  @IsOptional()
  themeId?: string | null;

  @IsString()
  @IsOptional()
  speakerId?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
