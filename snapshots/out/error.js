(r) => {
  if (r.method === 'GET') {
    let u = r.url,
      s = u.indexOf('/', 12) + 1,
      e = u.indexOf('?', s),
      p = e === -1 ? u.slice(s) : u.slice(s, e);
    if (p === '') {
      if (me(f1())) {
        let mh = [],
          c = mwc(r, mh);
        return new Response(f2(t, c), c);
      }
      return new Response(f3());
    }
  }
  return mwn;
};
