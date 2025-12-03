import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './entities/user.entity';
import { compelteRegisterDto } from './dto/completeRegister.dto';
import { InterserviceService } from '../interservice/interservice.service';
import mongoose, { Model, ClientSession, Types, SchemaTypes, Connection } from 'mongoose';
import { refreshTokenDto } from 'src/auth/dto/refreshTokenDto.dto';
import { upgradeProfileDto } from './dto/upgradeProfile.dto';
import { AddressDto } from './dto/addAdress.dto';
import { UpdateAddressDto } from './dto/updateAdress.sto';
import { IdentityDto } from 'src/user/dto/Identity.dto';
import { use } from 'passport';
import { userFilterDto } from './dto/userFilter.dto';
import { KafkaProducerService } from 'src/kafka/kafka.producer';
import { log } from 'util';
import { IdentityService } from 'src/identity/identity.service';
import winston, { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
// import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    @InjectModel('userM') private userModel: Model<UserDocument>,
    private readonly internalService: InterserviceService,
    private readonly kafkaService: KafkaProducerService,
    @InjectConnection() private readonly connection: Connection,
    private identityOfUser: IdentityService
  ) {
    this.logger.warn({ message: 'hello its test for logging' })
  }

  async checkOrCreate(phoneNumber: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findOne({ phoneNumber: phoneNumber })

      console.log('user after getting', user);
      if (!user) {
        const oldUser =
          await this.internalService.checkExistOldUser(phoneNumber);
        console.log(oldUser);

        if (oldUser.statusCode == 2) {
          await session.abortTransaction();
          return;
        }
        if (oldUser && oldUser.statusCode == 1) {
          console.log('oldUser', oldUser);

          const oldNewUser = await this.userModel.create({
            phoneNumber,
            firstName: oldUser.data.firstName,
            lastName: oldUser.data.lastName,
            fatherName: oldUser.data.fatherName,
            nationalCode: oldUser.data.nationalCode,
            birthDate: oldUser.data.birthDate,
            authStatus: 3,
            identityStatus: 1,
          });


          console.log('its hereeee created old userrrrrrrrrrrrr', oldNewUser)

          const wallet = {
            owner: oldNewUser._id,
            balance: 0,
            goldWeight: oldUser.data.goldWeight,
          };

          // Create wallet through internal service
          await this.internalService.createWallet(wallet);

          // Commit the transaction
          await session.commitTransaction();
          return oldNewUser;
        } else if (oldUser.statusCode == 0) {
          let newUser = await this.userModel.create(
            { phoneNumber: phoneNumber, authStatus: 1, identityStatus: 0 },
          );
          console.log('new user isssssssssss', newUser)
          // Commit the transaction
          await session.commitTransaction();
          return newUser;
        }
      }

      // Commit the transaction
      await session.commitTransaction();
      return user;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم'
      }
    } finally {
      session.endSession();
    }
  }


  /**
   * its for completing registrating
   * @param userId 
   * @param data 
   * @returns 
   */
  async completeRegister(userId: string, data: compelteRegisterDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      console.log(userId);

      const user = await this.userModel.findByIdAndUpdate(userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        fatherName: data.fatherName,
        adresses: data.adresses,
        email: data.email,
        authStatus: 2,
      }, { session });

      console.log(user);

      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      const wallet = {
        owner: user._id,
        balance: 0,
        goldWeight: '0',
      };

      // Create wallet through internal service
      await this.internalService.createWallet(wallet);

      // Commit the transaction
      await session.commitTransaction();

      return {
        message: 'ثبت نام شما کامل شد',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }

  async identity(userId: string, data: IdentityDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      let userExistance = await this.userModel.find({
        nationalCode: data.nationalCode,
      }).session(session);

      if (userExistance.length > 0) {
        await session.abortTransaction();
        return {
          message: 'کاربر گرامی کد ملی شما در اپلیکیشن وجود دارد.',
          statusCode: 400,
          error: 'کاربر گرامی کد ملی شما در اپلیکیشن وجود دارد.',
        };
      }

      const user = await this.userModel.findByIdAndUpdate(userId, {
        birthDate: data.birthDate,
        nationalCode: data.nationalCode,
        authStatus: 2,
        identityStatus: 2,
      }, { session });

      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      let userAfterUpdate = await this.userModel.findById(userId).session(session);
      console.log('adsf', userAfterUpdate);

      // Commit the transaction
      await session.commitTransaction();

      return {
        message: '',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }

  async getAllUser(query: userFilterDto) {
    try {
      let { search } = query;

      const hasSearch = query.search && query.search !== 'undefined';
      const limit = query.limit && !isNaN(+query.limit) ? query.limit : 20
      const page = query.page && !isNaN(+query.page) ? query.page : 1
      console.log('its queryyyy', query)
      let total;

      if (!isNaN(+query.identityStatus)) {
        const searchCondition: any = hasSearch
          ? {
            $and: [
              {
                $or: [
                  { firstName: { $regex: new RegExp(search, 'i') } },
                  { lastName: { $regex: new RegExp(search, 'i') } },
                  { nationalCode: { $regex: new RegExp(search, 'i') } },
                  { phoneNumber: { $regex: new RegExp(search, 'i') } },
                ],
              }, {
                identityStatus: query.identityStatus
              }
            ]
          }
          : {
            identityStatus: query.identityStatus
          };

        const users = await this.userModel.find(searchCondition)
          .skip(limit * (page - 1))
          .limit(limit)

        total = await this.userModel.countDocuments(searchCondition)
        return {
          message: '',
          statusCode: 200,
          data: {
            users,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          },
        };
      } else {
        const searchCondition: any = hasSearch
          ? {
            $or: [
              { firstName: { $regex: new RegExp(search, 'i') } },
              { lastName: { $regex: new RegExp(search, 'i') } },
              { nationalCode: { $regex: new RegExp(search, 'i') } },
              { phoneNumber: { $regex: new RegExp(search, 'i') } },
            ],
          }
          : {};

        const users = await this.userModel.find(searchCondition)

          .skip(limit * (page - 1))
          .limit(limit)

        total = await this.userModel.countDocuments(searchCondition)

        return {
          message: '',
          statusCode: 200,
          data: {
            users,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          },
        };
      }
    } catch (error) {
      console.log('error', error);
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }

  async getUsersProvinces() {
    try {
      const array = [] as { name: string; value: number }[];

      const users = await this.userModel.find();

      for (const user of users) {
        for (const addr of user.adresses) {
          const province = addr.province?.trim();
          if (!province) continue;

          const checkForExistingProvince = array.find(
            (item) => item.name === province,
          );

          if (checkForExistingProvince) {
            checkForExistingProvince.value += 1;
          } else {
            array.push({ name: province, value: 1 });
          }
        }
      }

      return {
        data: array,
        message: 'تعداد کاربران بر اساس استان',
        statusCode: 200,
      };
    } catch (error) {
      console.log('errrrr', error);
      return {
        data: null,
        message: 'خطا در دریافت اطلاعات',
        statusCode: 500,
      };
    }
  }

  async upgradeProfile(userId: string, data: upgradeProfileDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      console.log(userId);

      const user = await this.userModel.findByIdAndUpdate(userId, {
        birthDate: data.birthDate,
        nationalCode: data.nationalCode,
        identityStatus: 2,
      }, { session });

      console.log(user);

      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      // Commit the transaction
      await session.commitTransaction();

      return {
        message: 'ثبت نام شما کامل شد',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }

  async addAddress(userId: string, data: AddressDto) {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { adresses: data } },
        { new: true },
      );
      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }
      return {
        message: '',
        statusCode: 200,
        data: user.adresses,
      };
    } catch (error) {
      console.log('error in creating address', error)
      return {
        message: 'خطای داخلی سیستم',
        statusCode: 500,
        error: 'خطای داخلی سیستم'
      };
    }
  }



  async addAddressByAdminInPhoneBuy(nationalCode: string, data: AddressDto) {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { nationalCode },
        { $push: { adresses: data } },
        { new: true },
      );
      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }
      return {
        message: '',
        statusCode: 200,
        data: user.adresses,
      };
    } catch (error) {
      console.log('error in creating address', error)
      return {
        message: 'خطای داخلی سیستم',
        statusCode: 500,
        error: 'خطای داخلی سیستم'
      };
    }
  }


  async getAddresses(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return {
        message: 'کاربر پیدا نشد',
        statusCode: 400,
        error: 'کاربر پیدا نشد',
      };
    }
    return {
      message: '',
      statusCode: 200,
      data: user.adresses,
    };
  }

  async getSpecificAddress(req: any, res: any, adressId: string) {
    let userId = req.user.userId;
    let address = await this.userModel.findById(userId);

    if (!address) {
      return {
        message: 'آدرس مورد نظر یافت نشد',
        statusCode: 400,
        error: 'آدرس مورد نظر یافت نشد',
      };
    }

    let list;
    for (let i of address.adresses) {
      if (i._id == adressId) {
        list = i;
      }
    }
    console.log('address is >>>', address?.adresses);
    return {
      message: 'موفق',
      statusCode: 200,
      data: list,
    };
  }




  async getAddressesByAdmin(nationalCode: string) {
    const user = await this.userModel.findOne({ nationalCode });
    if (!user) {
      return {
        message: 'کاربر پیدا نشد',
        statusCode: 400,
        error: 'کاربر پیدا نشد',
      };
    }
    return {
      message: '',
      statusCode: 200,
      data: user.adresses,
    };
  }


  async updateAddress(userId: string, data: UpdateAddressDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      const index = user.adresses.findIndex((i) => i._id == data.adressId);

      if (index == -1) {
        await session.abortTransaction();
        return {
          message: 'آدرس پیدا نشد',
          statusCode: 400,
          error: 'آدرس پیدا نشد',
        };
      }

      console.log('findedAdress', user.adresses[index]);

      user.adresses[index].adress = data.adress;
      user.adresses[index].name = data.name;
      user.adresses[index].plate = data.plate;
      user.adresses[index].postCode = data.postCode;
      user.adresses[index].unit = data.unit;

      await user.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      return {
        message: '',
        statusCode: 200,
        data: user.adresses,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }



  async updateAddressByAdminInPhoneInvoice(nationalCode: string, data: UpdateAddressDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    console.log('bodyyyy', data)
    try {
      const user = await this.userModel.findOne({ nationalCode }).session(session);
      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      const index = user.adresses.findIndex((i) => i._id == data.adressId);

      if (index == -1) {
        await session.abortTransaction();
        return {
          message: 'آدرس پیدا نشد',
          statusCode: 400,
          error: 'آدرس پیدا نشد',
        };
      }

      console.log('findedAdress', user.adresses[index]);

      user.adresses[index].adress = data.adress;
      user.adresses[index].name = data.name;
      user.adresses[index].plate = data.plate;
      user.adresses[index].postCode = data.postCode;
      user.adresses[index].unit = data.unit;
      user.adresses[index].city = data.city;
      user.adresses[index].province = data.province;

      await user.save({ session });


      // Commit the transaction
      await session.commitTransaction();

      let newAddress = await this.userModel.findOne({ nationalCode })

      return {
        message: '',
        statusCode: 200,
        data: newAddress?.adresses,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }

  async deleteAddress(userId: string, adressId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      console.log('its here for delete address >>>> ', adressId, userId);
      const user = await this.userModel.findById(userId).session(session);

      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      console.log('addressesss >>>> ', user.adresses);

      let list: any = [];
      for (let i of user.adresses) {
        if (i._id != adressId) {
          list.push(i);
        }
      }

      await user.updateOne({ adresses: list }, { session });

      let updated = await this.userModel.findById(userId).session(session);

      console.log('addressesss >>>> ', updated?.adresses);

      // Commit the transaction
      await session.commitTransaction();

      return {
        message: '',
        statusCode: 200,
        data: updated?.adresses,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }




  async deleteAddressByAdminInPhoneInvoice(nationalCode: string, adressId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      console.log('its here for delete address >>>> ', adressId, nationalCode);
      const user = await this.userModel.findOne({ nationalCode }).session(session);

      if (!user) {
        await session.abortTransaction();
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      console.log('addressesss >>>> ', user.adresses);

      let list: any = [];
      for (let i of user.adresses) {
        if (i._id != adressId) {
          list.push(i);
        }
      }

      await user.updateOne({ adresses: list }, { session });

      let updated = await this.userModel.findOne({ nationalCode }).session(session);

      console.log('addressesss >>>> ', updated?.adresses);

      // Commit the transaction
      await session.commitTransaction();

      return {
        message: '',
        statusCode: 200,
        data: updated?.adresses,
      };
    } catch (error) {
      console.log('error', error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      session.endSession();
    }
  }

  async changeStatus(userId: string, identityStatus: number) {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      identityStatus,
    });

    if (!user) {
      return {
        message: 'کاربر پیدا نشد',
        statusCode: 400,
        error: 'کاربر پیدا نشد',
      };
    }
    return {
      message: '',
      statusCode: 200,
      data: user,
    };
  }

  async deletAll() {
    await this.userModel.deleteMany();
    return {
      message: 'ok',
      statusCode: 200,
    };
  }


  async getByNationalCodeInternal(body: any) {

    if (!body.nationalCode) {
      return {
        message: 'لطفا داده های صحیح را ارسال کنید',
        statusCode: 400
      }
    }

    let nationalCode = body.nationalCode

    let user = await this.userModel.findOne({ nationalCode })
    console.log({ message: 'user is here', user })
    const session: ClientSession = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      if (!user) {
        console.log({ message: 'user not exist' })
        user = await new this.userModel({
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          fatherName: body.fatherName,
          nationalCode: body.nationalCode,
          birthDate: body.birthDate,
          authStatus: body.authStatus,
          identityStatus: body.identityStatus,
        }).save({ session })
        const wallet = {
          owner: user._id,
          balance: 0,
          goldWeight: '0',
        };
        console.log({ message: 'user created', user })

        await this.internalService.createWallet(wallet)
        console.log({ message: 'wallet created for user' })

      }

      await session.commitTransaction()

      return {
        message: 'done',
        statusCode: 200,
        data: user,
        code: 1
      }

    } catch (error) {
      console.log('error in fucking create new user from order and installment', error)
      await session.abortTransaction()
      return {
        message: 'خطای داخلی سرور',
        statusCode: 500,
        error: 'حطای داخلی سرور',
        code: 0
      }
    } finally {
      await session.endSession()
    }
  }



  async getByNationalCodeInternalForCreateOrder(body: any) {

    if (!body.nationalCode) {
      return {
        message: 'لطفا داده های صحیح را ارسال کنید',
        statusCode: 400
      }
    }

    let nationalCode = body.nationalCode

    let user = await this.userModel.findOne({ nationalCode })
    try {
      if (!user) {
        return {
          message: 'کاربر یافت نشد',
          statusCode: 500,
          error: 'کاربر یافت نشد',
          code: 2
        }
      }
      return {
        message: 'done',
        statusCode: 200,
        data: user,
        code: 1
      }

    } catch (error) {
      console.log('error in fucking create new user from order and installment', error)
      return {
        message: 'خطای داخلی سرور',
        statusCode: 500,
        error: 'حطای داخلی سرور',
        code: 0
      }
    }
  }



  async findById(userId: string) {
    // const session: ClientSession = await this.userModel.db.startSession();
    // session.startTransaction();
    try {
      const user = await this.userModel.findById(userId);
      // const user = await this.userModel.findById(userId).session(session)
      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }
      // await session.commitTransaction();
      return {
        message: 'ثبت نام شما کامل شد',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.log('error', error);
      // await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      console.log('its here for commig');
      // session.endSession();
    }
  }



  /**
   * this end point is for checking nationalCode identity of user from admin pannel 
   * @param nationalCode 
  */
  async checkIdentityByAdmin(phoneNumber: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findOne({ phoneNumber: phoneNumber })

      console.log('user after getting', user);
      if (!user) {
        const oldUser =
          await this.internalService.checkExistOldUser(phoneNumber);
        console.log(oldUser);

        if (oldUser.statusCode == 2) {
          await session.abortTransaction();
          return {
            message: 'خطای داخلی',
            statusCode: 500,
            error: 'حطای داخلی'
          };
        }
        if (oldUser && oldUser.statusCode == 1) {
          console.log('oldUser', oldUser);

          const oldNewUser = await this.userModel.create({
            phoneNumber,
            firstName: oldUser.data.firstName,
            lastName: oldUser.data.lastName,
            fatherName: oldUser.data.fatherName,
            nationalCode: oldUser.data.nationalCode,
            birthDate: oldUser.data.birthDate,
            authStatus: 3,
            identityStatus: 1,
          });

          const wallet = {
            owner: oldNewUser[0]._id,
            balance: 0,
            goldWeight: oldUser.data.goldWeight,
          };

          // Create wallet through internal service
          await this.internalService.createWallet(wallet);

          // Commit the transaction
          await session.commitTransaction();
          return {
            message: 'کاربر با موفقیت اضافه شد',
            statusCode: 200,
            data: {
              user: oldNewUser,
              exist: true
            }
          };
        } else if (oldUser.statusCode == 0) {

          // Commit the transaction
          await session.commitTransaction();
          return {
            message: 'کاربر وجود ندارد',
            statusCode: 200,
            data: {
              user: {},
              exist: false
            }
          };
        }
      }

      await session.commitTransaction();
      return {
        message: 'کاربر وجود دارد',
        statusCode: 200,
        data: {
          user: user,
          exist: true
        }
      };
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم'
      }
    } finally {
      session.endSession();
    }
  }


  async identityOfUserFromAdmin(body: IdentityDto) {
    try {

      let { phoneNumber, nationalCode, birthDate } = body

      let existanceOfUserPhone = await this.userModel.find({ phoneNumber })
      let existanceOfUser = await this.userModel.find({ nationalCode })

      if (existanceOfUser.length > 0) {
        return {
          message: 'کاربر با این کد ملی قبلا ثبت نام کرده',
          statusCode: 400,
          error: 'کاربر با این کد ملی قبلا ثبت نام کرده'
        }
      }
      if (existanceOfUserPhone.length > 0) {
        return {
          message: 'کاربر با این شماره موبایل قبلا ثبت نام کرده',
          statusCode: 400,
          error: 'کاربر با این شماره موبایل قبلا ثبت نام کرده'
        }
      }

      let responseOfIdentity = await this.identityOfUser.identityCheck(phoneNumber, nationalCode, birthDate)

      if (!responseOfIdentity) {
        return {
          message: 'خطای داخلی',
          statusCode: 500,
          error: 'خطای داخلی'
        }
      }

      if (responseOfIdentity.status === 3) {
        // user information is wrong
        return {
          message: 'اطلاعات کاربر نادرست است',
          statusCode: 500,
          error: 'اطلاعات کاربر نادرست است'
        }

      }


      if (responseOfIdentity.status === 2) {
        return {
          message: 'شماره تلفن با کد ملی مطابقت ندارد',
          statusCode: 400,
          error: 'شماره تلفن با کد ملی مطابقت ندارد'
        }
      }

      if (responseOfIdentity.status == 1 || responseOfIdentity.status == 4) {
        console.log('its fucking herrrrrrrrrr', responseOfIdentity)
        return {
          message: 'سیستم احراز هویت موقتا در دسترس نمی باشد',
          statusCode: 503,
          error: 'سیستم احراز هویت موقتا در دسترس نمی باشد'
        }
      }

      if (responseOfIdentity.status === 6 || responseOfIdentity.status === 5) {

        return {
          message: 'کاربر با موفقیت احراز شد',
          statusCode: 200,
          data: responseOfIdentity.saveUser
        }
      }
    } catch (error) {
      console.log('error in identifing user >>>>', error)
      return {
        message: 'خطای داخلی سیستم',
        statusCode: 500,
        error: 'خطای داخلی سیستم'
      }
    }
  }




  async findByIdByAdmin(userId: string) {
    // const session: ClientSession = await this.userModel.db.startSession();
    // session.startTransaction();
    try {
      console.log('findby id ...... ', userId);
      const user = await this.userModel.findById(userId);
      // const user = await this.userModel.findById(userId).session(session)
      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }
      // await session.commitTransaction();
      return {
        message: 'ثبت نام شما کامل شد',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.log('error', error);
      // await session.abortTransaction();
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    } finally {
      console.log('its here for commig');
      // session.endSession();
    }
  }

  async getUserByNatinalCode(nationalCode: string) {
    try {
      const thisUser = await this.userModel.findOne({ nationalCode });

      console.log(thisUser, 'thisUser');

      if (!thisUser) {
        return {
          message: 'user not found',
          statusCode: 400,
          data: null,
        };
      }
      return {
        message: 'successfully done',
        statusCode: 200,
        data: thisUser,
      };
    } catch (error) {
      return {
        message: 'internal server error',
        statusCode: 500,
        data: null,
      };
    }
  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  
  async activation(userId: string) {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        return {
          message: 'کاربر پیدا نشد',
          statusCode: 400,
          error: 'کاربر پیدا نشد',
        };
      }

      if (user.isActive) {
        await user.updateOne({ isActive: false });
      } else {
        await user.updateOne({ isActive: true });
      }

      const updatedUser = await this.userModel.findById(userId);

      return {
        message: 'done',
        statusCode: 200,
        data: updatedUser,
      };
    } catch (error) {
      console.log('error', error);
      return {
        message: 'مشکلی از سمت سرور به وجود آمده',
        statusCode: 500,
        error: 'خطای داخلی سیستم',
      };
    }
  }
}
