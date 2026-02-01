import { build } from '@mapl/web/generic';
import { getDependency } from 'runtime-compiler';
import main from './main.ts';

export default {
  fetch: getDependency(build(main)),
};
