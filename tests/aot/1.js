import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_,_1,_2,_3,_4,)=>{var __0=(()=>{var t=["text/html","application/json"].map(c=>["Content-Type",c]),[h,j]=t,[oh,oj]=t.map(c=>({headers:[c]})),[n,b]=[404,400].map(s=>new Response(null,{status:s}));return(r)=>{if(r.method==="GET"){let u=r.url,s=u.indexOf("/",12)+1,e=u.indexOf("?",s),p=e===-1?u.slice(s):u.slice(s,e);if(p===""){return new Response(_2())}{let l=p.length;if(l>0){if(p[0]==="u"){if(l>5)if(p.startsWith("ser/",1)){if(p.indexOf("/",5)===-1){let q0=p.slice(5);return new Response(_3(,q1))}}}}}}else if(r.method==="POST"){let u=r.url,s=u.indexOf("/",12)+1,e=u.indexOf("?",s),p=e===-1?u.slice(s):u.slice(s,e);if(p==="body"){let hd=[],c={status:200,req:r,headers:hd};return (async()=>{hd.push(j);return new Response(JSON.stringify(await _4(c)),c)})()}}return n}})();_.push(__0,)})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(0)
};