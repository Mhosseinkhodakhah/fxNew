import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { upgradeProfileDto } from './dto/upgradeProfile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { compelteRegisterDto } from './dto/completeRegister.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UpdateAddressDto } from './dto/updateAdress.sto';
import { AddressDto } from './dto/addAdress.dto';
import { IdentityDto } from './dto/Identity.dto';
import { JwtAdminAuthGuard } from 'src/jwt/admin-jwt-auth.guard';
import { userFilterDto } from './dto/userFilter.dto';
import { LockerService } from 'src/locker/locker.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly lockerService: LockerService,
  ) {}

  // @Post('test-kafka')
  // async testKafka(@Body() body: any) {
  //   await this.userService.emitUserCreatedEvent(body);
  //   return { message: 'Kafka event sent', data: body };
  // }

  @Post('/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'complete user info' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: compelteRegisterDto,
    description: 'data must like this dto',
  })
  complete(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: compelteRegisterDto,
  ) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    return this.lockerService.withDatabaseLock(
      `user-complete-${userId}`,
      () => this.userService.completeRegister(userId, body),
      { ttl: 5000 }
    );
  }
  
  @Post('/identity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'identity user info' })
  @ApiResponse({
    status: 200,
    description: 'the user identity info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user identity info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: IdentityDto,
    description: 'data must like this dto',
  })
  identity(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: IdentityDto,
  ) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    console.log('body', body);

    return this.lockerService.withDatabaseLock(
      `user-identity-${userId}`,
      () => this.userService.identity(userId, body),
      { ttl: 5000 }
    );
  }

  @Post('/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update user info' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: upgradeProfileDto,
    description: 'data must like this dto',
  })
  upgrade(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: upgradeProfileDto,
  ) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    return this.lockerService.withDatabaseLock(
      `user-upgrade-${userId}`,
      () => this.userService.upgradeProfile(userId, body),
      { ttl: 5000 }
    );
  }

  @Get('/info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get user info' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  getUser(@Req() req: any, @Res() res: any) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    return this.userService.findById(userId);
  }


  @Post('/admin/identity/check/:phoneNumber')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'check user identity by admin' })
  async checkUserByAdmin(@Param('phoneNumber') phoneNumber : string){
    return this.userService.checkIdentityByAdmin(phoneNumber)
  }


  @Post('/admin/identity')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type : IdentityDto
  })
  @ApiOperation({ summary: 'user identity by admin' })
  async identityOfUserByAdmin(@Body(new ValidationPipe()) body : IdentityDto){
    return this.userService.identityOfUserFromAdmin(body)
  }







  @Get('/admin/info/:userId')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get user info by admin' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  getUserByAdmin(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: string,
  ) {
    console.log('reqUser', req.user);
    return this.userService.findByIdByAdmin(userId);
  }


  @Post('/address/add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'add address to user ' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: AddressDto,
    description: 'data must like this dto',
  })
  addAdress(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: AddressDto,
  ) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    return this.lockerService.withDatabaseLock(
      `user-address-${userId}`,
      () => this.userService.addAddress(userId, body),
      { ttl: 5000 }
    );
  }



  /**
   * this is for adding address by admin in phone buy 
   * @param req 
   * @param res 
   * @param body 
   * @param id 
   * @returns 
   */
  @Post('/admin/address/add/:nationalCode')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'add address to user ' })
  @ApiResponse({
    status: 200,
    description: 'the address successfully done',
    schema: {
      example: {
        success: true,
        message: 'the address successfully done',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the address creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this address already exists',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: AddressDto,
    description: 'data must like this dto',
  })
  @ApiParam({
    name : 'nationalCode',
    type : ';lakdscvz;oiuwjea;ldskfk'
  })
  addAdressByAdminInPhoneInvoice(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: AddressDto,
    @Param('nationalCode') nationalCode : string
  ) {
    return this.lockerService.withDatabaseLock(
      `user-address-${nationalCode}`,
      () => this.userService.addAddressByAdminInPhoneBuy(nationalCode, body),
      { ttl: 5000 }
    );
  }



  @Post('/address/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update address for user' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: UpdateAddressDto,
    description: 'data must like this dto',
  })
  updateAdress(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: UpdateAddressDto,
  ) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    return this.lockerService.withDatabaseLock(
      `user-address-${userId}`,
      () => this.userService.updateAddress(userId, body),
      { ttl: 5000 }
    );
  }



  @Post('/admin/address/update/:nationalCode')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update address for user' })
  @ApiResponse({
    status: 200,
    description: 'the user complete info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user complete info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    type: UpdateAddressDto,
    description: 'data must like this dto',
  })
  updateAdressByAdminInphoneBuy(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: UpdateAddressDto,
    @Param('nationalCode') nationalCode : string,
  ) {
    // console.log('reqUser', req.user);
    const userId = nationalCode;
    return this.lockerService.withDatabaseLock(
      `user-address-${userId}`,
      () => this.userService.updateAddressByAdminInPhoneInvoice(nationalCode, body),
      { ttl: 5000 }
    );
  }


  @Get('/address/remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'remove user address' })
  @ApiResponse({
    status: 200,
    description: 'remove user address succeed',
    schema: {
      example: {
        success: true,
        message: 'remove user address succeed',
        error: null,
        data : {}
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  removeAddress(@Req() req: any, @Res() res: any, @Param('id') id: string) {
    let userId = req.user.userId
    return this.lockerService.withDatabaseLock(
      `user-address-${userId}`,
      () => this.userService.deleteAddress(userId, id),
      { ttl: 5000 }
    );
  }


  @Get('/admin/address/remove/:id/:nationalCode')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'remove user address' })
  @ApiResponse({
    status: 200,
    description: 'remove user address succeed',
    schema: {
      example: {
        success: true,
        message: 'remove user address succeed',
        error: null,
        data : {}
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  removeAddressByAdmin(@Req() req: any, @Res() res: any, @Param('id') id: string , @Param('nationalCode') nationalCode: string) {
    // let userId = req.user.userId
    return this.lockerService.withDatabaseLock(
      `user-address-${nationalCode}`,
      () => this.userService.deleteAddressByAdminInPhoneInvoice(nationalCode, id),
      { ttl: 5000 }
    );
  }


  @Get('/address')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all user address' })
  @ApiResponse({
    status: 200,
    description: 'get all user address succeed',
    schema: {
      example: {
        success: true,
        message: 'get all user address succeed',
        error: null,
        data : {}
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  getUserAdress(@Req() req: any, @Res() res: any) {
    const userId = req.user.userId;
    return this.userService.getAddresses(userId);
  }


  /**
   * this is for getting specific users address by admin
   * @param req 
   * @param res 
   * @param id 
   * @returns 
   */
  @Get('/admin/address/:nationalCode')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all user address' })
  @ApiResponse({
    status: 200,
    description: 'get all user succeed',
    schema: {
      example: {
        success: true,
        message: 'get all user succeed',
        error: null,
        data : {}
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  getAddressesByAdminInPhoneBuy(@Req() req: any, @Res() res: any , @Param('nationalCode') nationalCode : string) {
    return this.userService.getAddressesByAdmin(nationalCode);
  }


  @Get('/address/:addressId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get user address' })
  @ApiResponse({
    status: 200,
    description: 'get ngo succeed',
    schema: {
      example: {
        success: true,
        message: 'get address succeed',
        error: null,
        data : {}
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  getUserSpecificAdress(
    @Req() req: any,
    @Res() res: any,
    @Param('addressId') addressId: string,
  ) {
    return this.userService.getSpecificAddress(req, res, addressId);
  }

  @Post('/chs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'identity user info' })
  @ApiResponse({
    status: 200,
    description: 'the user identity info successfully',
    schema: {
      example: {
        success: true,
        message: 'the user identity info successfully',
        error: null,
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    schema: {
      example: {
        success: false,
        message: 'the ngo creation failed',
        error: 'forbidden user',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'duplicate data',
    schema: {
      example: {
        success: false,
        message: 'this project already cpmpleted',
        error: 'duplicate project',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal service error',
    schema: {
      example: {
        success: false,
        message: 'internal error',
        error: 'internal service error',
        data: null,
      },
    },
  })
  @ApiBody({
    description: 'data must like this dto',
  })
  changeStatus(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: any,
  ) {
    console.log('reqUser', req.user);
    const userId = req.user.userId;
    console.log('body', body.identityStatus);
    return this.lockerService.withDatabaseLock(
      `user-status-${userId}`,
      () => this.userService.changeStatus(userId, body.identityStatus),
      { ttl: 5000 }
    );
  }

  @Get('/remover')
  async deleter() {
    return this.userService.deletAll();
  }


  @Post("/internal/user")
  async getUserFromInternal(
    @Body() body : any
  ){
    return this.userService.getByNationalCodeInternal(body)
  }


  @Post("/internal/user/nationalCode")
  async getByNationalCodeInternalForCreateOrder(
    @Body() body : any
  ){
    return this.userService.getByNationalCodeInternalForCreateOrder(body)
  }


  @Get('/admin/users')
  // @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth()
  async getAllUsers(@Query() query: userFilterDto) {
    return this.userService.getAllUser(query);
  }

  @Patch('/disable/:id')
  async disable(@Param('id') userId: string) {
    return this.lockerService.withDatabaseLock(
      `user-disable-${userId}`,
      () => this.userService.activation(userId),
      { ttl: 5000 }
    );
  }

  @Get('/provinces')
  @UseGuards(JwtAdminAuthGuard)
  // @ApiBearerAuth()
  async getUsersProvinces() {
    return this.userService.getUsersProvinces();
  }

  @Get('/useraddress')
  // @UseGuards(JwtAdminAuthGuard)
  // @ApiBearerAuth()
  async getUserAddress(@Query('user') user : string , @Query('address') address : string) {
    return this.userService.getAddressOfOrder(user , address);
  }

  @Get('/internal/nationalCode')
  // @UseGuards(JwtAdminAuthGuard)
  // @ApiBearerAuth()
  async getUserByNationalCode(@Query('nationalCode') query: string) {
    return this.userService.getUserByNatinalCode(query);
  }
}
