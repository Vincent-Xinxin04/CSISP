import { request } from 'undici';
import type { Dispatcher } from 'undici';

type HttpMethod = Dispatcher.HttpMethod;

type UpstreamLogger = {
  info: (obj: Record<string, unknown>, msg?: string) => void;
};

type Opts = {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  onLog?: (line: string) => void;
  logger?: UpstreamLogger;
};

// 工厂函数：基于给定的 baseURL 和默认配置创建一个轻量级 HTTP 客户端
export function createHttpClient(opts: Opts) {
  const base = opts.baseURL.replace(/\/$/, '');

  async function run(method: HttpMethod, url: string, init?: any) {
    const start = Date.now();

    const res = await request(base + url, {
      method,
      headers: opts.headers,
      body: init?.body,
    });

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Object.assign(new Error('Upstream Error'), { code: res.statusCode });
    }

    const dur = Date.now() - start;
    const traceId = opts.headers?.['X-Trace-Id'];
    const line = `${method} ${url} ${res.statusCode} ${dur}ms${
      traceId ? ` traceId=${traceId}` : ''
    }`;

    if (opts.logger) {
      opts.logger.info(
        {
          context: 'upstream',
          method,
          url,
          status: res.statusCode,
          duration: dur,
          traceId,
          line,
        },
        'Upstream request'
      );
    } else if (opts.onLog) {
      opts.onLog(line);
    } else {
      process.stdout.write(line + '\n');
    }

    return res;
  }

  return {
    // 发送 GET 请求
    get: (url: string) => run('GET', url),

    // 发送 POST 请求，自动将 body 序列化为 JSON 字符串
    post: (url: string, body?: any) => run('POST', url, { body: body && JSON.stringify(body) }),

    // 发送 PUT 请求，自动将 body 序列化为 JSON 字符串
    put: (url: string, body?: any) => run('PUT', url, { body: body && JSON.stringify(body) }),

    // 发送 DELETE 请求
    del: (url: string) => run('DELETE', url),

    // 从前面 run 返回的 Response 中解析 JSON
    json: async (p: Promise<any>) => (await p).body.json(),
  };
}
