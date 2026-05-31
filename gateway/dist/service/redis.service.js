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
exports.redisCache = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({
    url: 'redis://localhost:6379',
    // password: process.env.REDIS_PASSWORD // Good practice: use environment variables
});
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        console.log('Successfully connected to Redis');
    });
}
// Error handling
client.on('error', (err) => {
    console.error('Redis connection error:', err);
});
class redisCache {
    setter(key, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.set(key, msg);
        });
    }
    getter(key) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('cache is >>> ', yield client.get(key));
            return yield client.get(key);
        });
    }
    deleter(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.del(key);
        });
    }
}
exports.redisCache = redisCache;
// export async function basicStringOperations(): Promise<void> {
//     // Setting a value  
//     await client.set('test1', 'its a test for testing a bit test');
//     // Retrieving a value
//     const value: string | null = await client.get('test1');
//     console.log(value); // Output: value
//     // Setting with expiration (10 seconds)
//     await client.set('test1', 'hello its fucking testtttt >>>>> ', {
//         EX: 10
//     });
//     // Getting the value before expiration
//     const temporaryValue: string | null = await client.get('test1');
//     console.log(temporaryValue); // Output: temporary_value
//     // Waiting for the key to expire
//     // await new Promise(resolve => setTimeout(resolve, 11000));
//     // Getting the value after expiration
//     const expiredValue: string | null = await client.get('test1');
//     console.log('after getting from cache >>> ' , expiredValue); // Output: null
// }
