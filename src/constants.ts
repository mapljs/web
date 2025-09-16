import {
  CTX,
  PATH,
  REQ,
  URL,
  PATH_START,
  PATH_END,
  TMP,
} from '@mapl/framework/constants';
export * from '@mapl/framework/constants';

export const HEADERS: string = 'hd';
export const CTX_INIT: string =
  'let ' +
  HEADERS +
  '=[],' +
  CTX +
  '={status:200,req:' +
  REQ +
  ',headers:' +
  HEADERS +
  '};';

export const PARSE_PATH: string =
  'let ' +
  URL +
  '=' +
  REQ +
  '.url,' +
  PATH_START +
  '=' +
  URL +
  '.indexOf("/",12)+1,' +
  PATH_END +
  '=' +
  URL +
  '.indexOf("?",' +
  PATH_START +
  '),' +
  PATH +
  '=' +
  PATH_END +
  '===-1?' +
  URL +
  '.slice(' +
  PATH_START +
  '):' +
  URL +
  '.slice(' +
  PATH_START +
  ',' +
  PATH_END +
  ');';

export const CHTML: string = 'h';
export const CJSON: string = 'j';

export const OHTML: string = 'oh';
export const OJSON: string = 'oj';

export const R404: string = 'n';
export const R400: string = 'b';

export const GLOBALS: string =
  'var ' +
  TMP +
  '=["text/html","application/json"].map(c=>["Content-Type",c]),[' +
  CHTML +
  ',' +
  CJSON +
  ']=' +
  TMP +
  ',[' +
  OHTML +
  ',' +
  OJSON +
  ']=' +
  TMP +
  '.map(c=>({headers:[c]})),[' +
  R404 +
  ',' +
  R400 +
  ']=[404,400].map(s=>new Response(null,{status:s}));';
