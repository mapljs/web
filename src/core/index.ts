import type { Err } from 'safe-throw';
import type {
  AnyTypeInfo,
  ErrorHandler,
  MergeTypeInfo,
  Tag,
  TypeInfo,
} from './handler.js';

export type RouterTag = Tag<{ readonly 0: unique symbol }>;
export type AnyRouter = AnyTypeInfo & RouterTag;

/**
 * Create a router
 * @param middlewares
 * @param handlers
 * @param children
 */
export const init = <const T extends AnyTypeInfo[]>(
  middlewares: T,
  handlers: Tag<Partial<MergeTypeInfo<T>[1]>>[],
  children: Record<string, AnyRouter> = {},
): MergeTypeInfo<T> & RouterTag =>
  [middlewares, handlers, null, Object.entries(children)] as any;

/**
 * Handle router error
 * @param router
 * @param f
 */
export const onErr = <E extends Err, S extends {}>(
  router: TypeInfo<E, S> & RouterTag,
  f: ErrorHandler<E, S>,
): void => {
  // @ts-ignore
  router[2] = f;
};

export { default as compile } from './compile.js';
