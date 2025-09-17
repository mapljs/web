import { injectDependency } from 'runtime-compiler';
import { macro, type MiddlewareTypes } from '../core/middleware.js';
import type { RequestMethod } from '../core/utils.js';
import { pushHeaders } from './static-headers.js';
import { isHydrating } from 'runtime-compiler/config';
import { createContext } from '@mapl/framework';

export type HeaderValue = '*' | (string & {}) | [string, string, ...string[]];

// Ensure people don't make mistake categorizing headers
declare const _: unique symbol;
export type Header = [string, string] & {
  [_]: 0;
};
export type PreflightHeader = Header & {
  [_]: 1;
};

export const allowMethods = (
  v: RequestMethod[] | RequestMethod,
): PreflightHeader => ['access-control-allow-methods', v] as any;
export const allowHeaders = (v: string[] | string): PreflightHeader =>
  ['access-control-allow-headers', '' + v] as any;
export const maxAge = (v: number): PreflightHeader =>
  ['Aaccess-control-max-age', '' + v] as any;

export const allowCredentials: Header = [
  'access-control-allow-credentials',
  'true',
] as any;
export const exposeHeaders = (v: string[] | string): Header =>
  ['access-control-expose-headers', '' + v] as any;

// Need to create context
const createContextMacro = macro(createContext);

export const init: (
  origins: HeaderValue,
  preflightHeaders?: PreflightHeader[],
  headers?: Header[],
) => MiddlewareTypes<never, {}> = isHydrating
  ? () => createContextMacro
  : (origins, preflightHeaders = [], headers = []) => {
      if (origins !== '*') {
        headers.push(['vary', 'origin'] as any);

        if (Array.isArray(origins))
          return macro((scope) => {
            const pushPreflights = pushHeaders(preflightHeaders);
            const originList = injectDependency(JSON.stringify(origins));

            return (
              createContext(scope) +
              (injectDependency(
                '(r,' +
                  constants.HEADERS +
                  ')=>{let o=r.headers.get("origin");h.push(["access-control-allow-origin",typeof o==="string"&&' +
                  originList +
                  '.includes(o)?o:' +
                  originList +
                  '[0]]);' +
                  pushHeaders(headers) +
                  (pushPreflights === ''
                    ? 'r.method==="OPTIONS"&&' + pushPreflights + '}'
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
        const pushPreflights = pushHeaders(preflightHeaders);
        return (
          createContext(scope) +
          (pushPreflights === ''
            ? pushHeaders(headers)
            : injectDependency(
                '(r,' +
                  constants.HEADERS +
                  ')=>{' +
                  pushHeaders(headers) +
                  'r.method==="OPTIONS"&&' +
                  pushPreflights +
                  '}',
              ) +
              // Call the fn
              '(' +
              constants.REQ +
              ',' +
              constants.HEADERS +
              ');')
        );
      });
    };
