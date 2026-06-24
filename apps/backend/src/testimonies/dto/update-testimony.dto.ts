import { IsEnum } from 'class-validator';
import { TestimonyStatus } from '@prisma/client';

export class UpdateTestimonyDto {
  @IsEnum(TestimonyStatus)
  status: TestimonyStatus;
}
