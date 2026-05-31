import { WinstonModuleOptions } from "nest-winston";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";



export const winstonConfig : WinstonModuleOptions={

transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context || 'Application'}] ${level}: ${message}${
            trace ? `\n${trace}` : ''
          }`;
        }),
      ),
    }),

    // Error log file with rotation
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Combined log file with rotation
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],

}