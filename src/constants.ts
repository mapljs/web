import { MAPL, HEADERS, CTX, PATH } from '@mapl/framework/constants';
export * from '@mapl/framework/constants';

export const WEB: string = MAPL + 'w';

export const REQ: string = WEB + 'r';

export const CTX_FN: string = WEB + 'ci';
export const CTX_INIT: string = 'let ' + HEADERS + '=[],' + CTX + '=' + CTX_FN + '(' + REQ + ',' + HEADERS + ');';

export const URL: string = REQ + 'u';

export const PATH_START: string = PATH + 's';
export const PATH_END: string = PATH + 'e';
export const PARSE_PATH: string = 'let ' + URL + '=' + REQ + '.url,' + PATH_START + '=' + URL + '.indexOf("/",12)+1,' + PATH_END + '=' + URL + '.indexOf("?",' + PATH_START + '),' + PATH + '=' + PATH_END + '===-1?' + URL + '.slice(' + PATH_START + '):' + URL + '.substring(' + PATH_START + ',' + PATH_END + ');';

export const CHTML: string = WEB + 'h';
export const CJSON: string = WEB + 'j';
export const R404: string = WEB + 'nf';
export const R400: string = WEB + 'br';
export const GLOBALS: string = 'let [' + CHTML + ',' + CJSON + ']=["text/html","application/json"].map(c=>["content-type",c]),[' + R404 + ',' + R400 + ']=[404,400].map(s=>new Response(null,{status:s}));';
