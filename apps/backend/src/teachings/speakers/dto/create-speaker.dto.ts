import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
