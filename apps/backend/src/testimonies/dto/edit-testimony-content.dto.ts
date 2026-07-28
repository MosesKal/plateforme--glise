import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class EditTestimonyContentDto {
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'editedContent must contain text' })
  @MaxLength(2000)
  editedContent: string | null;
}
