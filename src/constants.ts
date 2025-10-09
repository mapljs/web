import {
  PATH,
  REQ,
  URL,
  PATH_START,
  PATH_END,
} from '@mapl/framework/constants';
export * from '@mapl/framework/constants';

export const HEADERS: string = 'h';
export const SERVER_INFO: string = 's';

export const BUN_FN_ARGS: string = '(' + REQ + ',' + SERVER_INFO + ')';
export const BUN_FN_START: string = BUN_FN_ARGS + '=>';

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
