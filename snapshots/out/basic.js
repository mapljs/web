(r) => {
  let u = r.url,
    s = u.indexOf('/', 12) + 1,
    e = u.indexOf('?', s),
    p = e === -1 ? u.slice(s) : u.slice(s, e);
  if (r.method === 'POST') {
    if (p === 'api/body') {
      let mh = [],
        c = mwc(r, mh);
      f1(c);
      c.id = f2();
      return (async () => {
        t = await f4(c);
        if (me(t)) {
          return mwb;
        }
        c.body = t;
        return new Response(f5(c), c);
      })();
    }
  }
  if (p === 'path') {
    let mh = [],
      c = mwc(r, mh);
    f1(c);
    c.id = f2();
    return new Response(f3(c), c);
  }
  return mwn;
};
