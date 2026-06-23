import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Public()
  @Get()
  findAllItems(
    @Query() pagination: PaginationDto,
    @Query('albumId') albumId?: string,
  ) {
    return this.galleryService.findAllItems(pagination, albumId);
  }

  @Public()
  @Get('albums')
  findAllAlbums() {
    return this.galleryService.findAllAlbums();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  createItem(@Body() dto: CreateGalleryItemDto) {
    return this.galleryService.createItem(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post('albums')
  createAlbum(@Body() dto: CreateAlbumDto) {
    return this.galleryService.createAlbum(dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.galleryService.removeItem(id);
  }
}
