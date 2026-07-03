import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { SpeakersService } from './speakers.service';

@Controller('teachings/speakers')
export class SpeakersController {
  constructor(private speakersService: SpeakersService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.speakersService.findAllPublic();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Get('all')
  findAllAdmin() {
    return this.speakersService.findAllAdmin();
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Post()
  create(@Body() dto: CreateSpeakerDto) {
    return this.speakersService.create(dto);
  }

  @Roles('Super Admin', 'Administrateur Général', 'Responsable Communication')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    return this.speakersService.update(id, dto);
  }

  @Roles('Super Admin', 'Administrateur Général')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakersService.remove(id);
  }
}
