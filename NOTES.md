# AOT
AOT compilation example usage.
- `entry.ts`: Export built dependencies IDs
  ```ts
  // Exclude `runtime-compiler` when bundling
  export const appId = build(app);
  ```
- `build.ts`: Build hydration code
  ```ts
  import { statements } from 'runtime-compiler';
  import 'runtime-compiler/config/loader/build';
  import './entry.ts';

  // Replace `runtime-compiler/config` with `runtime-compiler/config/mode/hydrate` when bundling.
  const hydratedCode = `
    import { $ } from 'runtime-compiler';
    export * from './entry.ts';
    ${statements}
  `;

  // Or with no bundler magic
  const hydratedCode = `
    import 'runtime-compiler/config/loader/hydrate';
    import { $ } from 'runtime-compiler';
    export * from './entry.ts';
    ${statements}
  `;
  ```
