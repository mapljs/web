import { Hono } from 'hono';
import { RegExpRouter } from 'hono/router/reg-exp-router';
import { createTest } from '../utils';

export const main = createTest({
  name: 'hono',
  fn: new Hono({ router: new RegExpRouter() })
    .get('/user', (c) => c.body('Hi user'))
    .get('/user/comments', (c) => c.body('Comments'))
    .get('/user/avatar', (c) => c.body('Avatar'))
    .get('/user/lookup/username/:username', (c) => c.body(c.req.param('username')))
    .get('/user/lookup/email/:address', (c) => c.body(c.req.param('address')))

    .get('/event/:id', (c) => c.body(c.req.param('id')))
    .get('/event/:id/comments', (c) => c.body(c.req.param('id') + ' comments'))

    .get('/map/:location/events', (c) => c.body('Events in ' + c.req.param('location')))
    .get('/status', (c) => c.body('OK'))
    .get('/very/deeply/nested/route/hello/there', (c) => c.body('Hello there'))
    .get('/static/*', (c) => c.body('Static'))
})
