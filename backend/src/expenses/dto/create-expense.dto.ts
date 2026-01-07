import { IsString, IsNotEmpty, IsNumber, IsPositive, MaxLength, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string; // Currency code (e.g., USD, EUR, GBP)

  @IsString()
  @IsNotEmpty()
  paidById: string; // User ID who paid
}

