import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { userToken } from 'src/interfaces/interfaces';

@Injectable()
export class TokenizeService {

    constructor(private readonly jwt : JwtService){

    }


    async tokenize(data : userToken ,  time : string , type : number){
        /**
         * this is for generating access token
         */
        if (type == 0){
            return this.jwt.sign(data, {
                secret: process.env.JWT_USER_SECRET,
                expiresIn: time
            })
        }


        /**
         * this is for generating refreshToken
         */
        if (type == 1){
            return this.jwt.sign(data, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: time
            })
        }
    }


    async checkRefreshToken(token: string) {
        try {
            let decoded = await this.jwt.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET
            })
            if (!decoded) {
                return false
            }
            return decoded
        } catch (error) {
            return false
        }
    }


}
