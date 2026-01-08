import { IsString, IsOptional, IsBoolean, MaxLength, IsIn } from 'class-validator';

export class UpdateGroupSettingsDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['EQUAL', 'UNEQUAL'])
  defaultSplitType?: string;
}

