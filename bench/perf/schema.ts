import { transformRoute, type PathTransformResult } from 'mapl-new-router/transform';

type ParamFunc = (...args: string[]) => string;

const schema: Record<
  string, Record<
    string,
    string | ParamFunc |
    { body: () => string, result: string | ParamFunc }
  >
> = {
  GET: {
    '/user': 'Hi user',
    '/user/comments': 'Comments',
    '/user/avatar': 'Avatar',
    '/user/lookup/username/:username': (username) => username,
    '/user/lookup/email/:address': (address) => address,
    '/event/:id': (id) => id,
    '/event/:id/comments': (id) => id + ' comments',
    '/map/:location/events': (location) => 'Events in ' + location,
    '/status': 'OK',
    '/very/deeply/nested/route/hello/there': 'Hello there',
    '/static/*': 'Static'
  }
};

const callHandler = (f: string | ParamFunc, params: string[], body?: string): string => typeof f === 'string' ? f : body == null ? f(...params) : f(...params, body);

export const constructPath = (parts: string[], params: string[]) => {
  let str = 'http://127.0.0.1';
  for (let i = 0; i < parts.length; i++)
    str += parts[i] + (params[i] ?? '');
  return str;
}

export const builtSchema: {
  method: string,
  path: string,
  body?: string,
  req: Request,
  expected: string
}[] = [];

export const requests: Request[] = [];

for (const method in schema) {
  const handlers = schema[method];
  for (const path in handlers) {
    const handler = handlers[path];

    let [params, parts] = transformRoute(path);
    params = params.map((a) => Math.random() + a);

    const body = typeof handler === 'object' ? handler.body() : undefined;
    const req = new Request(constructPath(parts, params), { method, body });

    builtSchema.push({
      method, path,
      expected: callHandler(
        typeof handler === 'object'
          ? handler.result
          : handler,
        params,
        body
      ),
      req, body
    });

    requests.push(req);
  }
}
