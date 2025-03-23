import { jitc, router } from '@mapl/app';

const app = router();
for (let i = 0; i < 1000; i++)
  app.get(`/${i}/*/${i}`, Math.random() < 0.5 ? () => "Hi" : async (_, c) => c.req.text());

(async () => {
  let t = process.hrtime.bigint();
  await jitc(app);
  t = process.hrtime.bigint() - t;
  console.log("Build time:", (t / 1000n) + 'ps');
})();
