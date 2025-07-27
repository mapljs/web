(r) => {
  if (r.method === 'GET') {
    let u = r.url,
      s = u.indexOf('/', 12) + 1,
      e = u.indexOf('?', s),
      p = e === -1 ? u.slice(s) : u.slice(s, e);
    if (p === '') {
      let mh = [],
        c = mwc(r, mh);
      f1(c);
      return new Response(f2(), c);
    }
  }
  return mwn;
};
