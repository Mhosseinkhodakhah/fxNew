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
const corlationId_1 = __importDefault(require("./middleware/corlationId"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = __importDefault(require("winston"));
const express_winston_1 = __importDefault(require("express-winston"));
const helmet_1 = __importDefault(require("helmet"));
// import xss from "xss-clean"
// import ratelimit from 'express-rate-limit'
const hpp_1 = __importDefault(require("hpp"));
const cors_1 = __importDefault(require("cors"));
const winston_2 = require("winston");
const router_1 = __importDefault(require("./service/router"));
const prom_client_1 = __importDefault(require("prom-client"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
const httpRequestCounter = new prom_client_1.default.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});
register.registerMetric(httpRequestCounter);
const { combine, timestamp, label, prettyPrint } = winston_2.format;
const app = (0, express_1.default)();
//security
app.use((0, helmet_1.default)());
app.use((0, hpp_1.default)());
app.use((0, cors_1.default)());
app.use(corlationId_1.default);
// app.use(session({
//     // Other session configurations
//     cookie: {
//       secure: true
//     }
//   }))
dotenv_1.default.config({ path: "./config/config.env" });
app.use((req, res, next) => {
    res.on("finish", () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.path,
            status: res.statusCode,
        });
    });
    next();
});
app.get("/hello", (req, res) => {
    res.send("Hello World!");
});
app.get("/metrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader("Content-Type", register.contentType);
    res.send(yield register.metrics());
}));
//set logger
app.use(express_winston_1.default.logger({
    transports: [
        new winston_1.default.transports.Console(),
        new winston_daily_rotate_file_1.default({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
        }),
    ],
    format: winston_2.format.combine(label({ label: "right meow!" }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), prettyPrint()),
    statusLevels: true,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: true,
    ignoreRoute() {
        return false;
    },
}));
// inside logger!!!!
winston_1.default.configure({
    format: winston_2.format.combine(label({ label: "right meow!" }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), prettyPrint()),
    transports: [
        new winston_1.default.transports.File({ filename: "inside.log" }),
        // new winston.transports.Console()
    ],
});
process.on("unhandledRejection", (error) => {
    statusMonitor_1.default.error.push(`${error}`);
    console.log("error occured . . .", error);
});
process.on("uncaughtException", (error) => {
    statusMonitor_1.default.error.push(`${error}`);
    console.log("error occured", error);
});
process.on("unhandledException", (error) => {
    statusMonitor_1.default.error.push(`${error}`);
    console.log("error occured . . .", error);
});
const port = process.env.PORT || 8010;
app.listen(port, () => {
    console.log("server connecting successfully . . .");
});
const routing = new router_1.default();
const ratelimit_1 = __importDefault(require("./ratelimit"));
const statusMonitor_1 = __importDefault(require("./service/statusMonitor"));
const blackList_middleware_1 = require("./blackList.middleware");
const redis_service_1 = require("./service/redis.service");
//proxeing
// app.use('/' , routing.proxy(`http://localhost:3000`))     // proxing to product service
app.use("/v1/main", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:3000`)); // proxing to django for report service
app.use("/v1/query", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:3003`)); // roxy to query service
app.use("/v1/secondmain", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:3002`)); // proxing to django for report service
app.use("/v1/trade", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:3011`)); // proxing to transaction and wallet
app.use("/v1/admin", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:5005`)); // proxing to admin service
app.use("/v1/logger", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:5010`)); // proxing to admin service
app.use("/v1/old", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:5004`)); // proxing to oldusers service
app.use("/v1/installment", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:5008`)); // proxing to installments service
app.use("/v1/report", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:8000`)); // proxing to django for report service
app.use("/v1/remmitance", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:5007`)); // proxing to django for report service
app.use("/v1/branch", ratelimit_1.default, blackList_middleware_1.blackListMiddleWare, routing.proxy(`http://localhost:3006`)); // proxing to django for report service
app.get("/monitor/all", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield statusMonitor_1.default.getter();
    return res.status(200).json(data);
}));
(0, redis_service_1.connectRedis)();
let a = new redis_service_1.redisCache();
