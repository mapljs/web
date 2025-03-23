import { router } from '@mapl/web';
import compile from '@mapl/web/router/compiler/generic';

const app = router().apply((c) => {
  c.headers.push(['access-control-allow-origins', '*'])
});
for (let i = 0; i < 100; i++)
  app.get(`/${i}/:param/${i}`, Math.random() < 0.5 ? () => "Hi" : async (_, c) => c.req.text());

let t = process.hrtime.bigint();
compile(app, []);
t = process.hrtime.bigint() - t;

console.log("Build time:", (t / 1000n) + 'ps');
