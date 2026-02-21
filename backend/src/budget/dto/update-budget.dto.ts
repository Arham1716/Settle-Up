import { IsDateString, IsNumber, IsPositive, IsArray, ValidateNested, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBudgetCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  allocatedAmount?: number;
}

export class UpdateBudgetDto {
  @IsDateString()
  @IsOptional()
  periodStart?: string;

  @IsDateString()
  @IsOptional()
  periodEnd?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBudgetCategoryDto)
  @IsOptional()
  categories?: UpdateBudgetCategoryDto[];
}
