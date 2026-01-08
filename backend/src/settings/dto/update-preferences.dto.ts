import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @IsString()
  @IsOptional()
  @MaxLength(3)
  defaultCurrency?: string;

  @IsString()
  @IsOptional()
  @IsIn(['1000', '1,000'])
  numberFormat?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;
}

