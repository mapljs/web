import { jitc, router } from '@mapl/app';

const app = router().apply((c) => {
  c.headers.push(['access-control-allow-origins', '*'])
});
for (let i = 0; i < 100; i++)
  app.get(`/${i}/*/${i}`, Math.random() < 0.5 ? () => "Hi" : async (_, c) => c.req.text());

(async () => {
  let t = process.hrtime.bigint();
  await jitc(app);
  t = process.hrtime.bigint() - t;
  console.log("Build time:", (t / 1000n) + 'ps');
})();
