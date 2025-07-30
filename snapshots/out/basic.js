(me, mwc, f1, f2, f3, f4, f5) => {
  'use strict';
  var t = ['text/html', 'application/json'].map((c) => ['Content-Type', c]),
    [mwh, mwj] = t,
    [mwoh, mwoj] = t.map((c) => ({ headers: [c] })),
    [mwn, mwb] = [404, 400].map((s) => new Response(null, { status: s }));
  return (r) => {
    let u = r.url,
      s = u.indexOf('/', 12) + 1,
      e = u.indexOf('?', s),
      p = e === -1 ? u.slice(s) : u.slice(s, e);
    if (r.method === 'POST') {
      if (p === 'api/body') {
        let c = mwc(r);
        f1(c);
        c.id = f2();
        return (async () => {
          let t = await f4(c);
          if (me(t)) {
            return mwb;
          }
          c.body = t;
          return new Response(f5(c), c);
        })();
      }
    }
    if (p === 'path') {
      let c = mwc(r);
      f1(c);
      c.id = f2();
      return new Response(f3(c), c);
    }
    return mwn;
  };
};
