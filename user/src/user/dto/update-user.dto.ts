import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string; // می‌توانید از @IsPhoneNumber() هم استفاده کنید

  @IsOptional()
  @IsString()
  location?: string;
}
