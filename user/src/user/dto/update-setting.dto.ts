// user-service/src/modules/user/dto/update-settings.dto.ts
import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';

export enum AccountStatus {
  ACTIVE = 'Active',
  DEACTIVE = 'Deactive',
  SUSPENDED = 'Suspended',
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  publicProfile?: boolean; // پیش‌فرض: true

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean; // پیش‌فرض: true

  @IsOptional()
  @IsBoolean()
  pushNotification?: boolean; // پیش‌فرض: true

  @IsOptional()
  @IsBoolean()
  showPerformanceStats?: boolean; // پیش‌فرض: true

  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus; // پیش‌فرض: AccountStatus.ACTIVE

  @IsOptional()
  @IsString()
  language?: string; // پیش‌فرض: 'en'
}
