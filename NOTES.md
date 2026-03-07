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

# New design

Ok so hear me out... for the 5th time I think I need to rewrite the API but anyways:

```ts
const root = router.init();
layer.tap(root, () => {});

const route = router.get(root, '/');
send.text(route, () => 'Hi');

const api = router.branch(root, '/api');
```

```ts
// Middleware design
layer((c) => {
  const res = preprocess(c);
  // Implement onEnd somehow to be fast
  onEnd(() => postprocess(res));
});
```
