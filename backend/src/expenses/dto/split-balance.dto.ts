import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum SplitType {
  EQUAL = 'EQUAL',
  UNEQUAL = 'UNEQUAL',
}

class MemberSplit {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  amount: string; // Decimal as string
}

export class SplitBalanceDto {
  @IsEnum(SplitType)
  splitType: SplitType;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'memberSplits cannot be empty when provided' })
  @ValidateNested({ each: true })
  @Type(() => MemberSplit)
  memberSplits?: MemberSplit[]; // Required only for UNEQUAL
}
