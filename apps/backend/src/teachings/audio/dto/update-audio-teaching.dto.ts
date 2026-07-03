import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioTeachingDto } from './create-audio-teaching.dto';

export class UpdateAudioTeachingDto extends PartialType(
  CreateAudioTeachingDto,
) {}
