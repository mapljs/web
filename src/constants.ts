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

export const WEB: string = 'mw';
export const LOCAL_DEPS: string = WEB + 'l';

export const CTX_FN: string = WEB + 'c';
export const CTX_INIT: string = 'let ' + CTX + '=' + CTX_FN + '(' + REQ + ');';

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

export const CHTML: string = WEB + 'h';
export const CJSON: string = WEB + 'j';

export const OHTML: string = WEB + 'oh';
export const OJSON: string = WEB + 'oj';

export const R404: string = WEB + 'n';
export const R400: string = WEB + 'b';

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
  ']=[404,400].map(s=>new Response(null,{status:s})),' +
  CTX_FN +
  '=(r)=>({status:200,req:r,headers:[]});';
