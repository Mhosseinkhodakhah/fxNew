import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class sendOtpDto{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example : '0922905555',
        required : true
    })
    phoneNumber : string

}


