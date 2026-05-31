// user-service/src/modules/user/dto/update-profile.dto.ts
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';

// تعریف Enum برای تجربه
export enum TradingExperience {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(TradingExperience)
  tradingExperience?: TradingExperience;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization?: string[]; // مثال: ['Crypto', 'Forex']

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tradingStyle?: string[]; // مثال: ['Day Trading', 'Scalping']
}
