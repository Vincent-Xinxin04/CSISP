import { request } from 'undici';
import type { Dispatcher } from 'undici';

// 支持的 HTTP 方法类型，直接复用 undici 内置定义
type HttpMethod = Dispatcher.HttpMethod;

// 创建 HTTP 客户端时的配置项
type Opts = {
  // 上游服务的基础地址，例如 http://localhost:3100
  baseURL: string;
  // 所有请求公共携带的请求头（可透传 Authorization / X-Trace-Id 等）
  headers?: Record<string, string>;
  // 预留：请求超时时间（当前未使用，可在需要时扩展）
  timeout?: number;
  // 预留：失败重试次数（当前未使用，可在需要时扩展）
  retries?: number;
  // 可选的日志函数，不传则默认输出到 stdout
  onLog?: (line: string) => void;
};

// 工厂函数：基于给定的 baseURL 和默认配置创建一个轻量级 HTTP 客户端
export function createHttpClient(opts: Opts) {
  // 规范化 baseURL，去掉末尾的 /
  const base = opts.baseURL.replace(/\/$/, '');

  // 核心执行函数：发起一次 HTTP 请求并记录简单访问日志
  async function run(method: HttpMethod, url: string, init?: any) {
    const start = Date.now();

    // 调用 undici.request 发送请求，这里只透传 method / headers / body 三个核心参数
    const res = await request(base + url, {
      method,
      headers: opts.headers,
      body: init?.body,
    });

    // 非 2xx 状态码统一视为上游错误，抛出异常交由调用方处理
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Object.assign(new Error('Upstream Error'), { code: res.statusCode });
    }

    // 记录耗时与可选的 traceId，方便链路排查
    const dur = Date.now() - start;
    const traceId = opts.headers?.['X-Trace-Id'];
    const line = `${method} ${url} ${res.statusCode} ${dur}ms${
      traceId ? ` traceId=${traceId}` : ''
    }`;

    if (opts.onLog) {
      opts.onLog(line);
    } else {
      process.stdout.write(line + '\n');
    }

    return res;
  }

  // 暴露给调用方的简化 API：get/post/put/delete + json 解析
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
