export * from '@mapl/framework/constants';
export * from '@mapl/router/constants';

// Additional args
export const CTX = 'mc';

export const HEADERS = 'mh';
export const PARSED_RESULT = 'mt';

export const CREATE_CTX: string = `let ${HEADERS}=[],${CTX}={status:200,headers:${HEADERS}};`;

// Mapl locals
export const REQ = 'mr';
export const INFO = 'mi';
export const FULL_URL = 'mu';

export const RES_404 = 'mnf';

export const JSON_HEADER = 'mjh';
export const JSON_OPTION = 'mjo';

export const HTML_HEADER = 'mhh';
export const HTML_OPTION = 'mho';

// Fast path for injecting mapl symbols
export const DECL_GLOBALS: string = `var ${JSON_HEADER}=['content-type','application/json'],${JSON_OPTION}={headers:${JSON_HEADER}},${HTML_HEADER}=['content-type','text/html'],${HTML_OPTION}={headers:${HTML_HEADER}},${RES_404}=new Response(null,{status:404});`;
