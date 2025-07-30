(me, mwc, f1, f2, f3) => {
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
        let t = f1();
        if (me(t)) {
          let c = mwc(r);
          return new Response(f2(t, c), c);
        }
        return new Response(f3());
      }
    }
    return mwn;
  };
};
