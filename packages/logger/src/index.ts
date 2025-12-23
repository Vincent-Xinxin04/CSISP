import pino, { type LoggerOptions } from 'pino';

const runtimeEnv = process.env.NODE_ENV || 'development';

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  transport:
    runtimeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', singleLine: true },
        }
      : undefined,
};

const baseLogger = pino(baseOptions);

export function createLogger(service: string) {
  return baseLogger.child({ service, env: runtimeEnv });
}

export const logger = createLogger('root');
