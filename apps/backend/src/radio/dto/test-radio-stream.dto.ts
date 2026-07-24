import { Transform } from 'class-transformer';
import { IsUrl, Matches, MaxLength } from 'class-validator';

export class TestRadioStreamDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\//i, { message: 'streamUrl doit utiliser HTTPS' })
  @MaxLength(2048)
  streamUrl: string;
}
