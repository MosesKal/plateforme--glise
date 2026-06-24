import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTestimonyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
