import { createHttpClient } from '@csisp/upstream';
import { getBaseLogger } from './logger';

export type BffHttpClient = ReturnType<typeof createHttpClient>;

export function createBffHttpClient(
  headers: Record<string, string> = {},
  traceId?: string
): BffHttpClient {
  const baseLogger = getBaseLogger();
  const logger = traceId
    ? baseLogger.child({ context: 'upstream', traceId })
    : baseLogger.child({ context: 'upstream' });

  return createHttpClient({
    baseURL: process.env.BACKEND_INTEGRATED_URL as string,
    headers,
    logger,
  });
}
