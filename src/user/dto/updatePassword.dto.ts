import { IsNotEmpty, IsString, MinLength, Matches } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'oldPassword123',
    required: true,
    description: 'Current password for verification',
  })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'رمز عبور باید شامل حروف و اعداد باشد',
  })
  @ApiProperty({
    example: 'newPassword123',
    required: true,
    description: 'New password (min 8 chars, letters + numbers)',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'newPassword123',
    required: true,
    description: 'Confirm new password - must match newPassword',
  })
  confirmPassword: string;
}
