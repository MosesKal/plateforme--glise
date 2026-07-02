import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { BulkCreateGalleryItemsDto } from './dto/bulk-create-gallery-items.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { GalleryQueryDto } from './dto/gallery-query.dto';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Public()
  @Get()
  findAllItems(@Query() query: GalleryQueryDto) {
    return this.galleryService.findAllItems(query);
  }

  @Public()
  @Get('albums')
  findAllAlbums() {
    return this.galleryService.findAllAlbums();
  }

  @Public()
  @Get('albums/:id')
  findOneAlbum(@Param('id') id: string) {
    return this.galleryService.findOneAlbum(id);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  createItem(@Body() dto: CreateGalleryItemDto) {
    return this.galleryService.createItem(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post('bulk')
  createItems(@Body() dto: BulkCreateGalleryItemsDto) {
    return this.galleryService.createItems(dto.items);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.galleryService.updateItem(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.galleryService.removeItem(id);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post('albums')
  createAlbum(@Body() dto: CreateAlbumDto) {
    return this.galleryService.createAlbum(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch('albums/:id')
  updateAlbum(@Param('id') id: string, @Body() dto: UpdateAlbumDto) {
    return this.galleryService.updateAlbum(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete('albums/:id')
  removeAlbum(@Param('id') id: string) {
    return this.galleryService.removeAlbum(id);
  }
}
