import { WinstonModuleOptions, WinstonModuleAsyncOptions } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { format } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const createLogFormat = () =>
  format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  );

// Custom filter to exclude validation errors and file-only logs from console
const excludeFromConsole = format((info) => {
  const isValidationError = info.level === 'warn' && 
    (String(info.message).includes('Validation Error') || 
     String(info.message).includes('validation') ||
     String(info.error).includes('Bad Request'));
  
  const isFileOnlyLog = info.fileOnly === true;
  
  if (isValidationError || isFileOnlyLog) {
    return false; // Don't log to console
  }
  return info;
});

export const winstonAsyncConfig: WinstonModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): WinstonModuleOptions => {
    const logFolder = configService.get<string>('LOG_FOLDER') || 'logs';
    const logLevel = configService.get<string>('LOG_LEVEL') || 'info';

    return {
      transports: [
        // Console transport for development - NestJS format (excludes validation errors and file-only logs)
        new winston.transports.Console({
          format: format.combine(
            excludeFromConsole(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(
              ({ timestamp, level, message, context, stack, ...meta }) => {
                const pid = process.pid;
                const contextStr = context ? ` [${context}]` : '';
                let log = `[Nest] ${pid}  - ${timestamp}     ${level.toUpperCase()}${contextStr} ${message}`;
                if (stack) {
                  log += `\n${stack}`;
                }
                return log;
              },
            ),
            format.colorize({ all: true }),
          ),
          level: logLevel,
        }),

        // Single daily rotating file transport for ALL logs with 20MB rotation
        new DailyRotateFile({
          filename: `${logFolder}/%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'silly', // Accept all log levels
          format: createLogFormat(),
          maxSize: '20m', // 20MB rotation
          maxFiles: '30d', // Keep logs for 30 days
          zippedArchive: true,
        }),
      ],
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
      },
      exitOnError: false,
    };
  },
};
