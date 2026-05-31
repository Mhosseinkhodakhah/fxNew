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
exports.adminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const secretKey = process.env.ADMIN_JWT || '69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2';
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.header['user'] = decoded;
        console.log('its done', req.header.user);
        if (decoded.isBlocked) {
            console.log('admin is blocked . . .');
            return res.status(403).json({
                success: false,
                scope: 'admin service',
                data: null,
                error: 'admin is blocked'
            });
        }
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            scope: 'admin service',
            data: null,
            error: 'invalid token'
        });
    }
});
exports.adminMiddleware = adminMiddleware;
