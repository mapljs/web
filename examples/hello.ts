import { compile, router } from "@mapl/web";

const app = router().post("/", async () => {
  console.log('GI')
    let meow = await fetch("https://jsonplaceholder.typicode.com/users");
    let res = meow.json();
    return "woo";
});

const fn = compile(app);
console.log(fn.toString())

export default { fetch: (req) =>
  {
  console.log(req);
  return fn(req);
  }, port: 5000 };
