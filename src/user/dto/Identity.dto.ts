import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdentityDto {
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Ali',
    required: true
  })
  firstName: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'mohammadi',
    required: true
  })
  lastName: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ebrahim',
    required: true
  })
  fatherName: string


  @IsString()
  @ApiProperty({
      example : '09902223344',
      required : true
  })
  @IsOptional()
  phoneNumber : string
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '4980323707',
    required: true,
  })
  nationalCode: string;
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '13790803',
    required: true,
  })
  birthDate: string;
}
