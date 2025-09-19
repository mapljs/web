import {
  CTX,
  PATH,
  REQ,
  URL,
  PATH_START,
  PATH_END,
} from '@mapl/framework/constants';
export * from '@mapl/framework/constants';

export const HEADERS: string = 'h';
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
