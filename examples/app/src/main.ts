import { router, send } from '@mapl/web';
import { compile as genericCompile, vars } from '@mapl/web/generic';
import { compile as denoCompile } from '@mapl/web/deno';
import { compile as cloudflareCompile } from '@mapl/web/cloudflare';
import { getDependency } from 'runtime-compiler';

const root = router.init();

send.body(
  router.get(root, '/'),
  (req, c) => {
    c.status = 418;
    return req.url;
  },
  vars.request,
);

send.html(
  router.get(root, '/home'),
  (req) => `<a>${req.url}</a>`,
  vars.request
);

send.jsonAsync(
  router.post(root, '/json'),
  (req) => req.json(),
  vars.request
);

console.log('\ngeneric:', getDependency(genericCompile(root)).toString());
console.log('\ndeno:', getDependency(denoCompile(root)).toString());
console.log('\ncloudflare:', getDependency(cloudflareCompile(root)).toString());
