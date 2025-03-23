import { router, compile } from '@mapl/web';

const app = router();
for (let i = 0; i < 1000; i++)
  app.get(`/${i}/:param/${i}`, Math.random() < 0.5 ? () => "Hi" : async (_, c) => c.req.text());

let t = process.hrtime.bigint();
compile(app);
t = process.hrtime.bigint() - t;

console.log("Build time:", (t / 1000n) + 'ps');
