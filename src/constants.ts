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
export const EXEC_CTX = 'mec';
export const FULL_URL = 'mu';

export const GENERIC_ARGS: string = `(${REQ})`;
export const BUN_DENO_ARGS: string = `(${REQ},${INFO})`;
export const CLOUDFLARE_ARGS: string = `(${REQ},${INFO},${EXEC_CTX})`;

export const RES_404 = 'mnf';
export const RES_200 = 'mok';

export const HTML_HEADER = 'mhh';
export const HTML_OPTION = 'mho';

// Fast path for injecting mapl symbols
export const DECL_GLOBALS: string = `let ${HTML_HEADER}=['content-type','text/html'],${HTML_OPTION}={headers:${HTML_HEADER}},${RES_404}=new Response(null,{status:404}),${RES_200}=new Response();`;
