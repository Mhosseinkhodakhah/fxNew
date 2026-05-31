import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddressDto {
  @IsString()
  @ApiProperty({ example: '123 Main St' })
  adress: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  plate: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  unit: number;

  @IsString()
  @ApiProperty({ example: '10001' })
  postCode: string;

  @IsString()
  @ApiProperty({
    example: 'خانه',
    required: false,
  })
  name: string;

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
