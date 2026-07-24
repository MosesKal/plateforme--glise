import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { TestRadioStreamDto } from './dto/test-radio-stream.dto';
import { UpsertRadioStationDto } from './dto/upsert-radio-station.dto';
import { RadioService } from './radio.service';

const RADIO_ADMIN_ROLES = [
  'Super Admin',
  'Administrateur Général',
  'Responsable Communication',
] as const;

@Controller('radio')
export class RadioController {
  constructor(private readonly radioService: RadioService) {}

  @Public()
  @Get('public')
  findPublic() {
    return this.radioService.findPublic();
  }

  @Roles(...RADIO_ADMIN_ROLES)
  @Get('admin')
  findAdmin() {
    return this.radioService.findAdmin();
  }

  @Roles(...RADIO_ADMIN_ROLES)
  @Put('admin')
  upsert(@Body() dto: UpsertRadioStationDto) {
    return this.radioService.upsert(dto);
  }

  @Roles(...RADIO_ADMIN_ROLES)
  @Post('admin/test')
  testStream(@Body() dto: TestRadioStreamDto) {
    return this.radioService.testStream(dto);
  }
}
