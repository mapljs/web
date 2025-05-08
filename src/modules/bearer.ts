import { err, type Err } from 'safe-throw';
import type { Context } from '../router/context';

export type TokenParser = (token: string, c: Context) => Promise<any>;
export type MalformedErr = Err<'Malformed bearer token'>;

const malformedErr = Promise.resolve(err('Malformed bearer token'));

// eslint-disable-next-line
export default <const T extends TokenParser>(verifier: T): (c: Parameters<T>[1]) => ReturnType<T> | Promise<MalformedErr> => async (c) => {
  const tok = c.req.headers.get('Authorization');
  return typeof tok === 'string' && tok.startsWith('Bearer ') && tok.length > 7 ? verifier(tok, c) as any : malformedErr;
};
