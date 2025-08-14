import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  let msg = typeof message === 'object' ? JSON.stringify(message) : message;
  if (meta && Object.keys(meta).length) {
    msg += ' ' + JSON.stringify(meta);
  }
  return `${timestamp} [${level}]: ${msg}`;
});

const transport = new (winston.transports.DailyRotateFile)({
  dirname: 'logs',
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    transport,
    new winston.transports.Console()
  ]
});

export const httpStream = {
  write: (message) => logger.info(message.trim())
};
