import { IsString, IsOptional, IsNumber, IsPositive, MaxLength } from 'class-validator';

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsString()
  @IsOptional()
  paidById?: string;
}


