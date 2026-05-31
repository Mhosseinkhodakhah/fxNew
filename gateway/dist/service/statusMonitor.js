"use strict";
// import { monitorInterface } from "../interface/interfaces.interface";
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
class interceptor {
    constructor() {
        this.requestCount = 0;
        this.status = { failed: 0, success: 0, internalIssues: 0 };
        this.error = [];
    }
    addStatus(info) {
        this.requestCount++;
        if (info.status == 0) {
            this.status.failed++;
        }
        if (info.status == 1) {
            this.status.success++;
        }
        if (info.status == 2) {
            this.status.internalIssues++;
        }
        (info.error) ? this.error.push(info.error) : console.log('');
        return true;
    }
    getter() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                all: this.requestCount,
                statusCount: this.status,
                error: this.error
            };
        });
    }
}
let monitor = new interceptor();
exports.default = monitor;
