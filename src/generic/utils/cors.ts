import type { Header, RequestMethod } from '../types.ts';
import type { Layer } from '../../compiler/router.ts';
import { isHydrating } from 'runtime-compiler/config';
import { injectDependency } from 'runtime-compiler';
import { injectArgsList } from 'runtime-compiler/utils';

export type PreflightHeader = Header & {
  '~': 0;
};

export const allowMethods = (
  methods:
    | [RequestMethod, RequestMethod, ...RequestMethod[]]
    | RequestMethod
    | '*',
): PreflightHeader => ['access-control-allow-methods', '' + methods] as any;

export const allowHeaders = (headers: string | string[]): PreflightHeader =>
  ['access-control-allow-headers', '' + headers] as any;

export const maxAge = (seconds: number): PreflightHeader =>
  ['access-control-max-age', '' + seconds] as any;

export const allowCredentials: Header = [
  'access-control-allow-credentials',
  'true',
] as any;

export const exposeHeaders = (
  headers: '*' | (string & {}) | [string, string, ...string[]],
): Header => ['access-control-expose-headers', '' + headers] as any;

const hydrateInit: Layer<any> = [
  (_, state) => ((state[1] = true), ''),
  null!,
  null!,
  null!,
];
const buildInit: Layer<any>[0] = (layer, state) => {
  state[1] = true;

  const origins = layer[1] as string | [string, string, ...string[]];
  const preflightHeaders = layer[2] as PreflightHeader[] | undefined;
  const headers = (layer[3] as Header[] | undefined) ?? [];

  if (origins !== '*') {
    headers.push(['vary', 'origin'] as any);

    if (Array.isArray(origins)) {
      let str =
        '(r,h)=>{let o=r.headers.get("origin");h.push(["access-control-allow-origin",typeof o==="string"&&o===' +
        JSON.stringify(origins[1]);
      for (let i = 2; i < origins.length; i++)
        str += '||o===' + JSON.stringify(origins[i]);

      return (
        injectDependency(
          str +
            '?o:' +
            JSON.stringify(origins[0]) +
            ']);' +
            (headers.length > 0
              ? 'h.push(' + injectArgsList(headers) + ');'
              : '') +
            (preflightHeaders != null
              ? 'r.method==="OPTIONS"&&h.push(' +
                injectArgsList(preflightHeaders) +
                ')}'
              : '}'),
        ) +
        // Call the fn
        '(' +
        constants.REQ +
        ',' +
        constants.HEADERS +
        ');'
      );
    }
  }

  headers.push(['access-control-allow-origin', origins] as Header);
  const pushHeaders =
    headers.length > 0 ? 'h.push(' + injectArgsList(headers) + ');' : '';
  return preflightHeaders != null
    ? injectDependency(
        '(r,h)=>{' +
          pushHeaders +
          'r.method==="OPTIONS"&&h.push(' +
          injectArgsList(preflightHeaders) +
          ')}',
      ) +
        // Call the fn
        '(' +
        constants.REQ +
        ',' +
        constants.HEADERS +
        ');'
    : pushHeaders;
};
export const init: (
  origins: '*' | (string & {}) | [string, string, ...string[]],
  preflightHeaders?: [PreflightHeader, ...PreflightHeader[]],
  headers?: [Header, ...Header[]],
) => Layer<any[]> = isHydrating
  ? () => hydrateInit
  : (origin, preflightHeaders, headers) => [
      buildInit,
      origin,
      preflightHeaders,
      headers,
    ];
