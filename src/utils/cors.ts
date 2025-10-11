import { injectDependency } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import { createContext } from '@mapl/framework';

import { macro, type MiddlewareTypes } from '../core/middleware.js';
import type { RequestMethod } from '../core/utils.js';
import type { Header } from '../core/context.js';
import { injectList } from './static-headers.js';

// Ensure people don't make mistake categorizing headers
declare const _: unique symbol;
export type CORSHeader = Header & {
  [_]: 0;
};
export type CORSPreflightHeader = Header & {
  [_]: 1;
};

export const allowMethods = (
  v: [RequestMethod, RequestMethod, ...RequestMethod[]] | RequestMethod | '*',
): CORSPreflightHeader => ['access-control-allow-methods', '' + v] as any;
export const allowHeaders = (v: string[] | string): CORSPreflightHeader =>
  ['access-control-allow-headers', '' + v] as any;
export const maxAge = (v: number): CORSPreflightHeader =>
  ['access-control-max-age', '' + v] as any;

export const allowCredentials: CORSHeader = [
  'access-control-allow-credentials',
  'true',
] as any;
export const exposeHeaders = (
  v: '*' | (string & {}) | [string, string, ...string[]],
): CORSHeader => ['access-control-expose-headers', '' + v] as any;

// Need to create context
const createContextMacro = macro(createContext);

export const init: (
  origins: '*' | (string & {}) | [string, string, ...string[]],
  preflightHeaders?: CORSPreflightHeader[],
  headers?: Header[],
) => MiddlewareTypes<any, never, {}> = isHydrating
  ? () => createContextMacro
  : (origins, preflightHeaders = [], headers = []) => {
      if (origins !== '*') {
        headers.push(['vary', 'origin'] as any);

        if (Array.isArray(origins))
          return macro((scope) => {
            const originList = injectDependency(JSON.stringify(origins));
            return (
              createContext(scope) +
              (injectDependency(
                '(r,h)=>{let o=r.headers.get("origin");h.push(["access-control-allow-origin",typeof o==="string"&&' +
                  originList +
                  '.includes(o)?o:' +
                  originList +
                  '[0]]);' +
                  (headers.length > 0
                    ? 'h.push(' + injectList(headers) + ');'
                    : '') +
                  (preflightHeaders.length > 0
                    ? 'r.method==="OPTIONS"&&h.push(' +
                      injectList(preflightHeaders) +
                      ')}'
                    : '}'),
              ) +
                // Call the fn
                '(' +
                constants.REQ +
                ',' +
                constants.HEADERS +
                ');')
            );
          });
      }

      headers.push(['access-control-allow-origin', origins] as Header);
      return macro((scope) => {
        const pushHeaders =
          headers.length > 0 ? 'h.push(' + injectList(headers) + ');' : '';
        return (
          createContext(scope) +
          (preflightHeaders.length > 0
            ? injectDependency(
                '(r,h)=>{' +
                  pushHeaders +
                  'r.method==="OPTIONS"&&h.push(' +
                  injectList(preflightHeaders) +
                  ')}',
              ) +
              // Call the fn
              '(' +
              constants.REQ +
              ',' +
              constants.HEADERS +
              ');'
            : pushHeaders)
        );
      });
    };
