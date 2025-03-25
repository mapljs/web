import { jitc, router } from '@mapl/app';

let t = process.hrtime.bigint();

const app = router();
for (let i = 0; i < 100; i++)
  app.apply((c) => {
    c.headers.push(['cookie', 'a=b']);
  });
app.get('/a/*/a', Math.random() < 0.5 ? () => "Hi" : async (_, c) => c.req.text())
await jitc(app);

t = process.hrtime.bigint() - t;

console.log("@mapl/app:", (Number(t / 1000n) / 1000).toFixed(2) + 'ms');
