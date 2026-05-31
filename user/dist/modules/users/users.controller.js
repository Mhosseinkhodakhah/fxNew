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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const users_service_1 = require("./users.service");
const constants_1 = require("../../common/constants");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async handleFindOrCreate(message) {
        return await this.usersService.findOrCreate(message.email);
    }
    async getUserInfo(message) {
        return await this.usersService.getUserInfo(message.userId);
    }
    async updateUserInfo(message) {
        return await this.usersService.updateUserInfo(message.userId, message.userData);
    }
    async getAllUsers() {
        return await this.usersService.getAllUsers();
    }
    async suspendUser(message) {
        return await this.usersService.suspendUser(message.id);
    }
    async changeRole(message) {
        return await this.usersService.changeRole(message.id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, microservices_1.MessagePattern)(constants_1.TOPICS.USERS.FIND_OR_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleFindOrCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(constants_1.TOPICS.USERS.GET_INFO),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserInfo", null);
__decorate([
    (0, microservices_1.MessagePattern)(constants_1.TOPICS.USERS.UPDATE_INFO),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserInfo", null);
__decorate([
    (0, microservices_1.MessagePattern)(constants_1.TOPICS.USERS.GET_ALL_USERS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, microservices_1.MessagePattern)(constants_1.TOPICS.USERS.SUSPEND_USER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspendUser", null);
__decorate([
    (0, microservices_1.MessagePattern)(constants_1.TOPICS.USERS.CHANGE_ROLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changeRole", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map