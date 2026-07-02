import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateGalleryItemDto } from './create-gallery-item.dto';

export class BulkCreateGalleryItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGalleryItemDto)
  items: CreateGalleryItemDto[];
}
