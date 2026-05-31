"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const enum_1 = require("../../common/types/enum");
let UsersService = UsersService_1 = class UsersService {
    userRepository;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findOrCreate(email) {
        let user = await this.userRepository.findOne({
            where: { email },
            relations: ['profile', 'settings'],
        });
        if (user) {
            this.logger.log(`User found with email: ${email}`);
            return user;
        }
        this.logger.log(`Creating new user with email: ${email}`);
        user = this.userRepository.create({
            email,
            isVerify: true,
            profile: {},
            settings: {},
        });
        await this.userRepository.save(user);
        return user;
    }
    async updateUserInfo(userId, updateData) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile', 'settings'],
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }
        user.isUpdated = true;
        this.userRepository.merge(user, updateData);
        try {
            const updatedUser = await this.userRepository.save(user);
            this.logger.log(`User with ID ${userId} updated successfully`);
            return {
                success: true,
                message: 'User updated successfully',
                data: updatedUser,
            };
        }
        catch (error) {
            this.logger.error(`Error updating user ${userId}:`, error);
            return {
                success: false,
                message: 'Failed to update user',
            };
        }
    }
    async getUserInfo(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: [
                    'id',
                    'email',
                    'firstName',
                    'lastName',
                    'followersCount',
                    'followingCount',
                    'role',
                    'phone',
                    'isSuspend',
                    'isUpdated',
                    'isVerify',
                    'createdAt',
                    'location',
                ],
                relations: ['profile'],
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            return {
                success: true,
                message: 'User founded',
                data: user,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getAllUsers() {
        try {
            const users = await this.userRepository.find({
                skip: 0,
                take: 50,
                relations: { profile: true },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    isVerify: true,
                    isSuspend: true,
                    role: true,
                    phone: true,
                    profile: {
                        id: true,
                        avatar: true,
                    },
                },
            });
            return {
                success: true,
                data: users,
                message: 'Users found!',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async suspendUser(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            if (user?.isSuspend) {
                await this.userRepository.update(userId, { isSuspend: false });
                return {
                    success: true,
                    message: 'User not suspend',
                };
            }
            else {
                await this.userRepository.update(userId, { isSuspend: true });
                return {
                    success: true,
                    message: 'User is suspend',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async changeRole(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            if (user?.role === enum_1.UserRole.USER) {
                await this.userRepository.update(userId, { role: enum_1.UserRole.TRADER });
                return {
                    success: true,
                    message: 'The user role was changed to Trader.',
                };
            }
            else {
                await this.userRepository.update(userId, { role: enum_1.UserRole.USER });
                return {
                    success: true,
                    message: 'The user role was changed to User.',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map