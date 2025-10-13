import { expect, test, describe } from 'bun:test';

import { bodyLimit, handle } from '@mapl/web';
import { router } from '@mapl/web/bun';

import { serveBun, serveGeneric } from './utils.ts';

describe('body limit', () => {
  const setupTest = (query: typeof fetch) => {
    test('under size limit', async () => {
      const res = await query('/yield', {
        method: 'POST',
        body: 'Hi',
      });

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hi');
    });

    test('over size limit', async () => {
      const res = await query('/yield', {
        method: 'POST',
        body: '93jgu29hunq0',
      });

      expect(res.status).toBe(413);
    });

    test('under size limit stream', async () => {
      const res = await query('/yield', {
        method: 'POST',
        body: new ReadableStream({
          start: (c) => {
            for (let i = 0; i < 9; i++) c.enqueue('a');
            c.close();
          },
        }),
      });

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('a'.repeat(9));
    });

    test('over size limit stream', async () => {
      const res = await query('/yield', {
        method: 'POST',
        body: new ReadableStream({
          start: (c) => {
            for (let i = 0; i < 4; i++) c.enqueue('abc' + Math.random());
            c.close();
          },
        }),
      });

      expect(res.status).toBe(413);
    });
  };

  const app = router(
    [bodyLimit.size(10)],
    [
      handle.post('/yield', async (c) => c.req.text(), {
        handler: handle.text,
      }),
    ],
  );

  describe('bun', () => setupTest(serveBun(3001, app)));
  describe('generic', () => setupTest(serveGeneric(3000, app)));
});
