import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  groupEvents?: boolean;

  @IsBoolean()
  @IsOptional()
  expenseEvents?: boolean;

  @IsBoolean()
  @IsOptional()
  inviteEvents?: boolean;

  @IsBoolean()
  @IsOptional()
  paymentDueEvents?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'none'])
  paymentReminderFrequency?: string;

  @IsString()
  @IsOptional()
  doNotDisturbFrom?: string; // Format: "HH:mm"

  @IsString()
  @IsOptional()
  doNotDisturbTo?: string; // Format: "HH:mm"

  @IsBoolean()
  @IsOptional()
  doNotDisturbAlways?: boolean;
}

