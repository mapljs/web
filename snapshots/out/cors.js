(me, mwc, f1, f2) => {
  'use strict';
  var t = ['text/html', 'application/json'].map((c) => ['Content-Type', c]),
    [mwh, mwj] = t,
    [mwoh, mwoj] = t.map((c) => ({ headers: [c] })),
    [mwn, mwb] = [404, 400].map((s) => new Response(null, { status: s }));
  return (r) => {
    if (r.method === 'GET') {
      let u = r.url,
        s = u.indexOf('/', 12) + 1,
        e = u.indexOf('?', s),
        p = e === -1 ? u.slice(s) : u.slice(s, e);
      if (p === '') {
        let c = mwc(r);
        f1(c);
        return new Response(f2(), c);
      }
    }
    return mwn;
  };
};
