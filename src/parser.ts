import type { Identifier } from 'runtime-compiler';

import type { ResponseState } from './response.ts';
import type { AnyLayer, Layer, AnyRouteLayer } from './layer.ts';
import { isHydrating } from 'runtime-compiler/config';
import { buildCall } from './compilers/call.ts';
import type { Err, InferErr, InferResult } from '@safe-std/error';
import { IS_ERR } from './compilers/globals.ts';

interface ResultStore<out Result> {
  1: Identifier<Result>;
}

/**
 * Describe a parser layer.
 */
export interface AnyParserLayer<Result> extends AnyLayer, ResultStore<Result> {}

export interface ParseLayer<Result> extends Layer, ResultStore<Result> {
  2: (...args: any[]) => Result | Promise<Result>;
  3: Identifier<any>[];
}
let uniqueId = 0;
const loadParse: ParseLayer<any>[0] = isHydrating
  ? (self, scope) => buildCall(scope, self[2], '', self[3].length)
  : (self, scope) => {
      const args = self[3];
      return (
        'let ' +
        self[1] +
        '=' +
        buildCall(scope, self[2], args.join(), args.length) +
        ';'
      );
    };
/**
 * Parse a value.
 */
export const init = <Args extends Identifier<any>[], Result>(
  fn: (
    ...args: [
      ...{
        [K in keyof Args]: Args[K]['~type'];
      },
      res: ResponseState,
    ]
  ) => Result | Promise<Result>,
  ...args: Args
): ParseLayer<Result> => [
  loadParse,
  (constants.PARSED_RESULT + uniqueId++) as any,
  fn,
  args,
];

/**
 * Get parser result.
 */
export const result = <T extends AnyParserLayer<any>>(parser: T): T[1] =>
  parser[1];

export interface OnErrLayer<T> extends Layer, ResultStore<InferResult<T>> {
  2: AnyParserLayer<T>;
  3: AnyRouteLayer<[InferErr<T>]>;
}
const loadOnErr: OnErrLayer<any>[0] = isHydrating
  ? (self, scope) => {
      const parser = self[2];
      parser[0](parser, scope);

      const handler = self[3];
      handler[0](handler, scope, '', 1);

      return '';
    }
  : (self, scope) => {
      const id = self[1];
      const parser = self[2];
      const handler = self[3];
      return (
        parser[0](parser, scope) +
        'if(' +
        IS_ERR +
        '(' +
        id +
        ')){' +
        handler[0](handler, scope, id, 1) +
        '}'
      );
    };
/**
 * Handle errors of a parser layer.
 */
export const onError = <T>(
  parser: AnyParserLayer<T>,
  handler: AnyRouteLayer<[InferErr<T>]>,
): OnErrLayer<T> => [loadOnErr, parser[1] as any, parser, handler];
