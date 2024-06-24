import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Create a Winston Logger
export const logger = winston.createLogger({
  defaultMeta: { service: 'api-gateway-service' },
  format: combine(
    colorize({ all: true }),
    timestamp(),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [],
});

interface LogInitOptions {
  env?: string;
  logLevel?: string;
}

export const logInit = ({ env, logLevel }: LogInitOptions) => {
  logger.add(
    new winston.transports.Console({
      level: logLevel,
      silent: env === 'testing',
    })
  );

  if (env !== 'development') {
    logger.add(
      new winston.transports.File({
        level: logLevel,
        filename: path.join(__dirname, '../../logs/api-gateway.log'),
      })
    );
  }
};

export const logDestroy = () => {
  logger.clear();
  logger.close();
};
