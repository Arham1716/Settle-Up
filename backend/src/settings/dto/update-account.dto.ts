import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

