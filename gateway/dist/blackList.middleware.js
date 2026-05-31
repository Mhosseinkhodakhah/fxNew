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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blackListMiddleWare = blackListMiddleWare;
const blackList_1 = __importDefault(require("./service/blackList"));
const statusMonitor_1 = __importDefault(require("./service/statusMonitor"));
function blackListMiddleWare(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.headers.authorization) {
            if (yield blackList_1.default.checker(req.headers.authorization)) {
                console.log('تلاش برای ورود با توکن غیر مجاز');
                console.log('ttttttt >>> ', yield blackList_1.default.checker(req.headers.authorization));
                console.log('check the blacklist>>>>>', blackList_1.default.checker(req.headers.authorization));
                statusMonitor_1.default.error.push(`تلاش برای ورود با توکن غیر مجاز`);
                return res.status(401).json({
                    error: "token is in the blackList"
                });
            }
            else {
                console.log('token is not in blacklist');
                next();
            }
        }
        else {
            console.log('no token provided');
            next();
        }
    });
}
