import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string; // Defaults to USD

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string; // Admin's display name in the group
}
