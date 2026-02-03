import { build } from '@mapl/web/cloudflare';
import { getDependency } from 'runtime-compiler';
import main from './main.ts';

const createFetch = getDependency(build(main));

export default {
  fetch(...args) {
    // Set up stuff...
    return (this.fetch = createFetch())(...args);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
