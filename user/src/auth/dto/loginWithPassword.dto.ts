import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class loginWithPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '0922905555',
    required: true,
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'strongPassword123',
    required: true,
  })
  password: string;
}
