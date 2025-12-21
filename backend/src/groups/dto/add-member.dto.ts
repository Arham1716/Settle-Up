import { IsNotEmpty, IsEmail } from 'class-validator';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string; // Find user by email to add
}
