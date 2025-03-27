import { router, compile } from '@mapl/web';
import { createTest } from '../utils';

export const main = createTest({
  name: '@mapl/web',
  fn: {
    fetch: compile(
      router()
        .get('/user', () => 'Hi user')
        .get('/user/comments', () => 'Comments')
        .get('/user/avatar', () => 'Avatar')
        .get('/user/lookup/username/:username', (username) => username)
        .get('/user/lookup/email/:address', (address) => address)

        .get('/event/:id', (id) => id)
        .get('/event/:id/comments', (id) => id + ' comments')

        .get('/map/:location/events', (location) => 'Events in ' + location)
        .get('/status', () => 'OK')
        .get('/very/deeply/nested/route/hello/there', () => 'Hello there')
        .get('/static/*', () => 'Static')
    )
  }
});
