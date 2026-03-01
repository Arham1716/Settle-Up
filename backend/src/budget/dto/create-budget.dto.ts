import { IsDateString, IsNumber, IsPositive, IsArray, ValidateNested, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  allocatedAmount: number;
}

export class CreateBudgetDto {
  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetCategoryDto)
  categories: CreateBudgetCategoryDto[];
}
