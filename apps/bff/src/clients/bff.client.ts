import { createHttpClient } from '@csisp/upstream';

export type BffHttpClient = ReturnType<typeof createHttpClient>;

export function createBffHttpClient(headers?: Record<string, string>): BffHttpClient {
  return createHttpClient({
    baseURL: process.env.BACKEND_INTEGRATED_URL as string,
    headers,
  });
}
