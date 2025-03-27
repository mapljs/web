import { router, jitc } from '@mapl/app';
import { createTest } from '../utils';

export const main = createTest({
  name: '@mapl/app',
  fn: await jitc(
    router()
      .get('/user', () => 'Hi user')
      .get('/user/comments', () => 'Comments')
      .get('/user/avatar', () => 'Avatar')
      .get('/user/lookup/username/*', (params) => params[0])
      .get('/user/lookup/email/*', (params) => params[0])

      .get('/event/*', (params) => params[0])
      .get('/event/*/comments', (params) => params[0] + ' comments')

      .get('/map/*/events', (params) => 'Events in ' + params[0])
      .get('/status', () => 'OK')
      .get('/very/deeply/nested/route/hello/there', () => 'Hello there')
      .get('/static/**', () => 'Static')
  )
});
