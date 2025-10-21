import { IsNotEmpty, IsNumber, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class validateOtpDto{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example : '0922905555',
        required : true
    })
    phoneNumber : string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example : 1111,
        required : true
    })
    otp:number

}


