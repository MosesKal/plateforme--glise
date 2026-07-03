import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ReorderItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderAudioTeachingsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
