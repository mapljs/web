import router from 'zesti';
import build from 'zesti/build/fast';
import { RegExpRouter } from 'hono/router/reg-exp-router';
import { createTest } from '../utils';

export const main = createTest({
  name: 'zesti',
  fn: {
    fetch: build(
      router()
        .get('/user', (c) => c.send('Hi user'))
        .get('/user/comments', (c) => c.send('Comments'))
        .get('/user/avatar', (c) => c.send('Avatar'))
        .get('/user/lookup/username/*', (params, c) => c.send(params[0]))
        .get('/user/lookup/email/*', (params, c) => c.send(params[0]))

        .get('/event/*', (params, c) => c.send(params[0]))
        .get('/event/*/comments', (params, c) => c.send(params[0] + ' comments'))

        .get('/map/*/events', (params, c) => c.send('Events in ' + params[0]))
        .get('/status', (c) => c.send('OK'))
        .get('/very/deeply/nested/route/hello/there', (c) => c.send('Hello there'))
        .get('/static/**', (_, c) => c.send('Static'))
    )
  }
})
