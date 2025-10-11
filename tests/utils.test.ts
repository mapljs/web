import { expect, test, describe } from 'bun:test';

import { bodyLimit, handle } from '@mapl/web';
import { router } from '@mapl/web/bun';
import { compileToHandlerSync } from '@mapl/web/bun/compiler/jit';

import { serve } from './utils.ts';

describe('body limit', () => {
  const PREFIX = serve({
    routes: compileToHandlerSync(
      router(
        [bodyLimit.size(10)],
        [
          handle.post('/yield', async (c) => c.req.text(), {
            type: handle.text,
          }),
        ],
      ),
    ),
    port: 3000,
    hostname: '127.0.0.1',
  });

  test('under size limit', async () => {
    const res = await fetch(PREFIX + '/yield', {
      method: 'POST',
      body: 'Hi',
    });

    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hi');
  });

  test('over size limit', async () => {
    const res = await fetch(PREFIX + '/yield', {
      method: 'POST',
      body: '93jgu29hunq0',
    });

    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(413);
  });

  test('under size limit stream', async () => {
    const res = await fetch(PREFIX + '/yield', {
      method: 'POST',
      body: new ReadableStream({
        start: (c) => {
          for (let i = 0; i < 9; i++) c.enqueue('a');
          c.close();
        },
      }),
    });

    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('a'.repeat(9));
  });

  test('over size limit stream', async () => {
    const res = await fetch(PREFIX + '/yield', {
      method: 'POST',
      body: new ReadableStream({
        start: (c) => {
          for (let i = 0; i < 4; i++) c.enqueue('abc' + Math.random());
          c.close();
        },
      }),
    });

    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(413);
  });
});
