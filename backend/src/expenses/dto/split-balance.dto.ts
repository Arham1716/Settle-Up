import { IsString, IsNotEmpty, IsEnum, IsObject, ValidateNested } from 'class-validator';
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

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => MemberSplit)
  memberSplits?: MemberSplit[]; // Required for UNEQUAL, optional for EQUAL
}


