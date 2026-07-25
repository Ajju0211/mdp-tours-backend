import { format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';

const isProduction = process.env.NODE_ENV === 'production';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.colorize(),
        format.printf(({ timestamp, level, message, context, ms, stack }) => {
          return `${timestamp} [${context || 'App'}] ${level}: ${message} ${ms} ${stack ? '\\n' + stack : ''}`;
        }),
      ),
    }),
    ...(isProduction
      ? [
          new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
          }),
          new transports.File({
            filename: 'logs/combined.log',
            format: format.combine(format.timestamp(), format.json()),
          }),
        ]
      : []),
  ],
});
