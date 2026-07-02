import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.contactService.findAll(pagination);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
