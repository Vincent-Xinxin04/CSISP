import { createLogger } from '@csisp/logger';

const baseLogger = createLogger('backend-integrated');

export function getBackendBaseLogger() {
  return baseLogger;
}

export function getBackendLogger(context?: string, traceId?: string) {
  let logger = baseLogger;
  if (context) {
    logger = logger.child({ context });
  }
  if (traceId) {
    logger = logger.child({ traceId });
  }
  return logger;
}
