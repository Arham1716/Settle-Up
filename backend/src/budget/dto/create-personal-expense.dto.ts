import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, MaxLength } from 'class-validator';

export class CreatePersonalExpenseDto {
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
  currency?: string;

  @IsString()
  @IsOptional()
  category?: string; // Category name (Food, Transport, Bills, etc.)
}
