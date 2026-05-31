"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_service_1 = require("./redis.service");
class blackListClass {
    constructor() {
        this.list = new redis_service_1.redisCache();
    }
    getter() {
        return this.list;
    }
    // setter(newToken : string){
    //     this.list.push(newToken)
    // }
    checker(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.list.getter('blackList');
            if (data) {
                let blackList = JSON.parse(data);
                if (blackList.includes(token)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        });
    }
}
const blackList = new blackListClass();
exports.default = blackList;
