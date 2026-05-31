import corlationId from "./middleware/corlationId";
import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import winston from "winston";
import expressWinston from "express-winston";
import cookieParser from "cookie-parser";
import helmet from "helmet";
// import xss from "xss-clean"
// import ratelimit from 'express-rate-limit'
import hpp from "hpp";
import cors from "cors";
import responseTime from "response-time";
import { createLogger, format, transports } from "winston";
import router from "./service/router";
import client from "prom-client";
import DailyRotateFile from 'winston-daily-rotate-file'
import ratelimit from "./ratelimit";
import monitor from "./service/statusMonitor";
import { adminMiddleware } from "./auth/auth.middleware";
import { blackListMiddleWare } from "./blackList.middleware";
import { connectRedis, redisCache } from "./service/redis.service";
import { ipChecker } from "./middleware/metricChecker";
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(httpRequestCounter);

const { combine, timestamp, label, prettyPrint } = format;

const app = express();

//security
app.use(helmet());
app.use(hpp());
app.use(cors());

app.use(corlationId)

// app.use(session({
//     // Other session configurations
//     cookie: {
//       secure: true
//     }
//   }))

dotenv.config({ path: "./config/config.env" });

//set logger
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({
      filename: '/var/log/application/gateway/gateway-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
    ],
    format: format.combine(
      label({ label: "right meow!" }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      prettyPrint()
    ),
    statusLevels: true,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: true,
    ignoreRoute() {
      return false;
    },
  })
);

// inside logger!!!!
winston.configure({
  format: format.combine(
    label({ label: "right meow!" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    prettyPrint()
  ),
  transports: [
    // new winston.transports.File({ filename: "inside.log" }),
    new DailyRotateFile({
          filename: '/var/log/application/gateway/inside/inside-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
        }),
    // new winston.transports.Console()
  ],
});

process.on("unhandledRejection", (error) => {
  monitor.error.push(`${error}`);
  console.log("error occured . . .", error);
});

process.on("uncaughtException", (error) => {
  monitor.error.push(`${error}`);
  console.log("error occured", error);
});

process.on("unhandledException", (error) => {
  monitor.error.push(`${error}`);
  console.log("error occured . . .", error);
});

const port = process.env.PORT || 8010;

app.listen(port, () => {
  console.log("server connecting successfully . . .");
});

const routing = new router();

//proxeing
app.use(
  "/v1/user",
  routing.proxy(`http://localhost:3000`)
); // proxing to django for report service

// connectRedis();

// let a = new redisCache();
