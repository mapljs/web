import { build } from '@mapl/web/bun';
import { getDependency } from 'runtime-compiler';
import main from './src/main.ts';

const routes = getDependency(build(main));

Bun.serve({ routes });
