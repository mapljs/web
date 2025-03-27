import Elysia from 'elysia';
import { createTest } from '../utils';

export const main = createTest({
  name: 'elysia',
  fn: new Elysia()
    .get('/user', () => 'Hi user')
    .get('/user/comments', () => 'Comments')
    .get('/user/avatar', () => 'Avatar')
    .get('/user/lookup/username/:username', (c) => c.params.username)
    .get('/user/lookup/email/:address', (c) => c.params.address)

    .get('/event/:id', (c) => c.params.id)
    .get('/event/:id/comments', (c) => c.params.id + ' comments')

    .get('/map/:location/events', (c) => 'Events in ' + c.params.location)
    .get('/status', () => 'OK')
    .get('/very/deeply/nested/route/hello/there', () => 'Hello there')
    .get('/static/*', () => 'Static')
});
