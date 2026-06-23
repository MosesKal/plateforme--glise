import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleEntryDto } from './create-schedule-entry.dto';

export class UpdateScheduleEntryDto extends PartialType(CreateScheduleEntryDto) {}
