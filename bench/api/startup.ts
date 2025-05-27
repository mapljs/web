import frameworks from './.out/index.js';
import { relative } from 'node:path';

await Bun.$`hyperfine ${frameworks.map((path) => 'node ./' + relative('.', path))} --runs 50 --warmup 10`;
