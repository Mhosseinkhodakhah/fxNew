import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @ApiProperty({ example: 'casjhckjsbfvc' })
  adressId: string;
  
  @IsString()
  @ApiProperty({ example: '123 Main St' })
  adress: string;

  @IsString()
  @ApiProperty({ example: '10001' })
  postCode: string;

  @IsNumber()
  @ApiProperty({ example: 122 })
  plate: number;

  @IsString()
  @ApiProperty({ example: 122 })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 1 })
  unit: number;

  @IsString()
  @ApiProperty({
    example: 'شیراز',
    required: false,
  })
  city: string;

  @IsString()
  @ApiProperty({
    example: 'فارس',
    required: false,
  })
  province: string;
}
