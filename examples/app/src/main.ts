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

router.post(root, '/json');

console.log('\ngeneric:', getDependency(genericCompile(root)).toString());
console.log('\ndeno:', getDependency(denoCompile(root)).toString());
console.log('\ncloudflare:', getDependency(cloudflareCompile(root)).toString());
