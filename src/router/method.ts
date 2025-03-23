import { ALL } from '@mapl/router/method';

export const METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;

export type Methods = typeof METHODS[number];
export type RequestMethod = Uppercase<Methods> | ALL | (string & {});

export { ALL };
