import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class refreshTokenDto{

    @IsString()
    @ApiProperty({
        example : 'cqklahckljacgbaskljhbcvgikebhxa',
        required : true
    })
    refreshToken : string

}


