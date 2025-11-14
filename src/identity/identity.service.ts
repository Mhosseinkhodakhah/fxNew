import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose, { Connection, Model } from 'mongoose';
// import { UserDocument } from 'src/user/entities/user.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IdentityService {
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
    constructor(
    ) { }


    async identityCheck(phoneNumber: string, nationalCode: string, birthDate: string) {
        // const session = await mongoose.startSession();
        // session.startTransaction();
        try {
            
            let token = await this.getToken()
            let info = {
                phoneNumber,
                nationalCode,
                birthDate
            }
            let response = await this.identity(info)
            if (!response) {
                // await session.abortTransaction();
                return ;
            }
            
            if (response.statusCode == 1) {                //    
                // await session.abortTransaction();
                // console.log("1", response.statusCode);
                return {status : 1};
                // user.identityStatus = 2;
                // await user.save({ session });
            } //?
            if (response.statusCode == 2) {                //    
                // await session.abortTransaction();
                // console.log("1", response.statusCode);
                return {status : 2};
                // console.log("2", response.statusCode);
                // user.identityStatus = 0;
                // await user.save({ session });
            } //?
            if (response.statusCode == 3) {                // the information of user is wrong
                console.log("3", response.statusCode);
                // await session.abortTransaction();
                // console.log("1", response.statusCode);
                return {status : 3};
                // user.identityStatus = 0;
                // await user.save({ session });
            } //?
            if (response.statusCode == 4) {               // error from goldBox
                console.log("3", response.statusCode);
                // await session.abortTransaction();
                // console.log("1", response.statusCode);
                return {status:4};
                // console.log("4", response.statusCode);
                // user.identityStatus = 2;
                // await user.save({ session });
            } //?
            if (response.statusCode == 6) {               // if users was already exists in goldBox
                console.log("response", response);
                console.log("6", response.statusCode);
                let newUser =  this.userRepo.create({
                    identityStatus : 1,
                    firstName : response.user.firstName,
                    lastName : response.user.lastName,
                    fatherName : response.user.fatherName,
                    phoneNumber : response.user.phoneNumber,
                    nationalCode : response.user.nationalCode,
                    birthDate : response.user.birthDate,
                })
                let saveUser = await this.userRepo.save(newUser);

                const wallet = {
                    owner: saveUser.id,
                    balance: 0,
                    goldWeight: response.user.goldWeight,
                };

                // Create wallet through external service (this is outside the transaction scope)
                const createdWallet = await this.createWallet(wallet);
                if (!createdWallet) {
                    console.log('error in creating wallet>>>')
                    // await session.abortTransaction();
                    return false;
                }
                // await session.commitTransaction()
                console.log("wallet", createdWallet);
                return {status :6 , saveUser}
            } //
            if (response.statusCode == 5) {                  // after identify user in goldBox
                console.log("response", response);
                console.log("6", response.statusCode);
                let newUser = this.userRepo.create({
                    identityStatus: 1,
                    firstName: response.user.firstName,
                    lastName: response.user.lastName,
                    fatherName: response.user.fatherName,
                    phoneNumber: response.user.phoneNumber,
                    nationalCode: response.user.nationalCode,
                    birthDate: response.user.birthDate,
                })
                let saveUser = await  this.userRepo.save(newUser);

                const wallet = {
                    owner: saveUser.id,
                    balance: 0,
                    goldWeight: "0",
                };

                // Create wallet through external service (this is outside the transaction scope)
                const createdWallet = await this.createWallet(wallet);
                if (!createdWallet){
                    console.log('error in creating wallet>>>')
                    // await session.abortTransaction();
                    return false;
                }
                console.log("wallet", createdWallet);
                // await session.commitTransaction()
                return {status : 5 , saveUser};
            }
        } catch (error) {
            console.log('error in getting user identity from goldBox' , error)
            return;
        }
    }



    async getToken() {
        const url = "https://gateway.khanetala.ir/v1/query/internal/getToken";
        const body = {
            userName: process.env.INTERSERVICE_TOKEN_USERNAME,
            password: process.env.INTERSERVICE_TOKEN_PASSWORD
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("لطفا دوباره امتحان کنید"); // or throw BadRequestException if in NestJS context
        }

        const data = await response.json();
        return data;
    }


    async identity(info) {
        const url = "https://gateway.khanetala.ir/v1/main/internal/user/identity";
        const token = await this.getToken();

        if (!token || !token.token) {
            throw new Error("لطفا دوباره امتحان کنید");
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(info),
        });

        // if (!response.ok) {
        //   throw new Error("لطفا دوباره امتحان کنید");
        // }

        const data = await response.json();
        return data || "unknown";
    }


    async createWallet(wallet) {
        const url = "http://localhost:9011/wallet";
        const body = wallet;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                //   'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("response", response);
        let rawResponse = await response.json()
        if (!rawResponse){
            return false;
        }
        if (!response.ok) {
            return false;
        }
        const data = await response.json(); // <-- this gets the actual data
        return data;
    }

}

