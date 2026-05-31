import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class updateUserInfoByNationalCodeDto{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example : '4980323707',
        required : true
    })
    nationalCode?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example : '09902223344',
        required : true
    })
    phoneNumber?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example : 'علیرضا',
        required : true
    })
    firstName?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example : 'زارع',
        required : true
    })
    lastName?: string
}


