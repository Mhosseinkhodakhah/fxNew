import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class upgradeProfileDto{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example : '09902223344',
        required : true
    })
    phoneNumber : string
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example : '4980323707',
        required : true
    })
    nationalCode : string
     @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example : '13790803',
        required : true
    })
    birthDate : string

}


