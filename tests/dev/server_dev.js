//#region ../../node_modules/@mapl/web_dev/core/index.js
var core_default = (middlewares, handlers, children) => [
	middlewares,
	handlers,
	,
	children
];

//#endregion
//#region ../../node_modules/runtime-compiler/index.js
let compiledDependencies = [];
let externalDependencies = [];
let cache = {};
let localDeps = ``;
let localDepsCnt = 0;
let injectDependency = (e) => {
	localDeps += `,$` + localDepsCnt + `=` + e;
	return `$` + localDepsCnt++;
};
let asyncDeps = ``;
let exportedDeps = ``;
let exportedDepsCnt = 0;
let exportDependency = (e) => {
	exportedDeps += e + `,`;
	return exportedDepsCnt++;
};
let getDependency = (v) => compiledDependencies[v];
let injectExternalDependency = (e) => `_` + externalDependencies.push(e);
let externalDependencyNames = () => {
	let e = `_,`;
	for (let y = 0; y < externalDependencies.length; y++) e += `_` + (y + 1) + `,`;
	return e;
};
let clear = () => {
	externalDependencies.length = 0;
	cache = {};
	localDeps = ``;
	localDepsCnt = 0;
	asyncDeps = ``;
	exportedDeps = ``;
	exportedDepsCnt = 0;
};
let noOp = () => ``;
let lazyDependency = (e, v) => {
	let b = Symbol();
	return () => cache[b] ??= e(v);
};
let evaluateCode = () => `{var $` + localDeps + (asyncDeps === `` ? `;_.push(` : `;[` + asyncDeps + `]=await Promise.all([` + asyncDeps + `]);_.push(`) + exportedDeps + `)}`;
let AsyncFunction$1 = (async () => {}).constructor;

//#endregion
//#region ../../node_modules/@mapl/web_dev/core/middleware.js
let macro = (f) => [-1, f];
let noOpMacro = macro(noOp);
let attach = (prop, f) => [
	1,
	f,
	prop
];

//#endregion
//#region ../../node_modules/runtime-compiler/config.js
let isHydrating = false;

//#endregion
//#region ../../node_modules/@mapl/web_dev/core/handler.js
let JSON_HEADER = isHydrating ? noOp : lazyDependency(injectDependency, `["content-type","application/json"]`);
let JSON_OPTIONS = isHydrating ? noOp : lazyDependency(injectDependency, `{headers:[` + JSON_HEADER() + `]}`);
let HTML_HEADER = isHydrating ? noOp : lazyDependency(injectDependency, `["content-type","application/json"]`);
let HTML_OPTIONS = isHydrating ? noOp : lazyDependency(injectDependency, `{headers:[` + JSON_HEADER() + `]}`);
let text = isHydrating ? noOp : (res, hasContext) => `return new Response(` + res + (hasContext ? `,c)` : `)`);
let get = (path, handler, dat) => [
	`GET`,
	path,
	handler,
	dat
];

//#endregion
//#region ../../node_modules/@safe-std/error/index.js
let _ = Symbol.for(`@safe-std/error`);
let isErr = (u) => Array.isArray(u) && u[0] === _;

//#endregion
//#region ../../node_modules/@mapl/framework/index.js
let IS_ERR_FN = lazyDependency(injectExternalDependency, isErr);
let createArgSet = (args) => {
	let len = args.length;
	let arr = new Array(len + 1);
	arr[0] = ``;
	arr[1] = args[1];
	for (let i = 2; i <= len; i++) arr[i] = arr[i - 1] + `,` + args[i];
	return arr;
};
let AsyncFunction = (async () => {}).constructor;
let compileHandlerHook;
let setCompileHandlerHook = (fn) => {
	compileHandlerHook = fn;
};
let compileErrorHandlerHook;
let setCompileErrorHandlerHook = (fn) => {
	compileErrorHandlerHook = fn;
};
let contextInit = ``;
let setContextInit = (init) => {
	contextInit = init;
};
let compileErrorHandler$1 = (input, scope) => scope[3] ??= compileErrorHandlerHook(input, scope[2][0], scope[2][1], scope);
let clearErrorHandler = (scope) => {
	scope[2] != null && (scope[3] = null);
};
let createContext = isHydrating ? (scope) => {
	if (!scope[1]) {
		scope[1] = true;
		clearErrorHandler(scope);
	}
	return ``;
} : (scope) => {
	if (scope[1]) return ``;
	scope[1] = true;
	clearErrorHandler(scope);
	return contextInit;
};
let createAsyncScope = isHydrating ? (scope) => {
	if (!scope[0]) {
		scope[0] = true;
		clearErrorHandler(scope);
	}
	return ``;
} : (scope) => {
	if (scope[0]) return ``;
	scope[0] = true;
	clearErrorHandler(scope);
	return `return (async()=>{`;
};
let setTmp = isHydrating ? (scope) => {
	scope[4] = true;
	return ``;
} : (scope) => {
	if (scope[4]) return `t`;
	scope[4] = true;
	return `let t`;
};
let compileGroup = (group, scope, prefix, content) => {
	if (group[2] != null) {
		scope[2] = group[2];
		scope[3] = null;
	}
	for (let i = 0, middlewares = group[0]; i < middlewares.length; i++) {
		let middleware = middlewares[i];
		let fn = middleware[1];
		let id = middleware[0];
		if (id === -1) content += fn(scope);
		else {
			let call = injectExternalDependency(fn) + `(`;
			if (fn.length > 0) {
				call += `c`;
				content += createContext(scope);
			}
			call += `)`;
			if (fn instanceof AsyncFunction) {
				call = `await ` + call;
				content += createAsyncScope(scope);
			}
			if (id === 0) content += call + `;`;
			else if (id === 1) content += createContext(scope) + `c.` + middleware[2] + `=` + call + `;`;
			else if (id === 2) content += setTmp(scope) + `=` + call + `;if(` + IS_ERR_FN() + `(t)){` + compileErrorHandler$1(`t`, scope) + `}`;
			else if (id === 3) content += setTmp(scope) + `=` + call + `;if(` + IS_ERR_FN() + `(t)){` + compileErrorHandler$1(`t`, scope) + `}` + createContext(scope) + `c.` + middleware[2] + `=t;`;
		}
	}
	for (let i = 0, handlers = group[1]; i < handlers.length; i++) {
		let handler = handlers[i];
		compileHandlerHook(handler, content, prefix + (handler[1] === `/` || prefix !== `` ? `` : handler[1]), scope);
	}
	let childGroups = group[3];
	if (childGroups != null) for (let childPrefix in childGroups) compileGroup(childGroups[childPrefix], scope.slice(), childPrefix === `/` ? prefix : prefix + childPrefix, content);
};

//#endregion
//#region ../../node_modules/@mapl/web_dev/utils/cors.js
let createContextMacro = macro(createContext);

//#endregion
//#region api.ts
var api_default = core_default([], [get("/", () => "Hi", { type: text })]);

//#endregion
//#region server.ts
var server_default = core_default([attach("id", () => performance.now())], [get("/path", (c) => "" + c.id, { type: text })], { "/api": api_default });

//#endregion
//#region ../../node_modules/@mapl/router/path/index.js
let countParams = (path) => {
	let cnt = path.endsWith(`**`) ? 2 : 0;
	for (let i = path.length - cnt; (i = path.lastIndexOf(`*`, i - 1)) !== -1; cnt++);
	return cnt;
};

//#endregion
//#region ../../node_modules/runtime-compiler/jit.js
let evaluateSync = () => {
	try {
		Function(externalDependencyNames(), evaluateCode())(compiledDependencies, ...externalDependencies);
	} finally {
		clear();
	}
};

//#endregion
//#region ../../node_modules/@mapl/web/compiler/jit.js
let RES404 = injectDependency(`new Response(null,{status:404})`);
let RES400 = injectDependency(`new Response(null,{status:400})`);
let paramArgs = createArgSet(new Array(16).fill(0).map((_1, i) => `q` + i));
let compileReturn = (dat, fnAsync, scopeAsync, contextCreated, result) => {
	let res = dat?.type;
	if (res == null) return `return ` + result;
	let str = res(fnAsync ? `await ` + result : result, contextCreated);
	return fnAsync && !scopeAsync ? `return (async()=>{` + str + `})()` : str;
};
let compileErrorHandler = (input, fn, dat, scope) => {
	let call = injectExternalDependency(fn) + `(` + input;
	if (fn.length > 1) {
		call += `,c`;
		if (!scope[1]) return contextInit + compileReturn(dat, fn instanceof AsyncFunction, scope[0], true, call + `)`);
	}
	return compileReturn(dat, fn instanceof AsyncFunction, scope[0], scope[1], call + `)`);
};

//#endregion
//#region ../../node_modules/@mapl/web/compiler/bun/router.js
let ROUTES;
let resetRouter = () => {
	ROUTES = {};
};
let insertRoute = (method, path, content) => {
	let isWildcard = path.endsWith(`**`);
	let i = 0;
	let bunPattern = isWildcard ? path.slice(-2).replace(/\*/g, () => `:q` + i++) + `*` : path.replace(/\*/g, () => `:q` + i++);
	let str = `(r,s)=>{`;
	if (i > 0) {
		str += `let {q0`;
		for (let j = 1, l = i - (isWildcard ? 1 : 0); j < l; j++) str += `q,` + j;
		str += `}=r.params` + (isWildcard ? `,q` + i + `=r.params["*"];` : `;`);
	}
	(ROUTES[bunPattern] ??= {})[method] = str + content + `}`;
	if (method !== `` && method !== `GET` && method !== `HEAD` && method !== `OPTIONS` && method !== `DELETE` && method !== `PATCH` && method !== `POST` && method !== `PUT`) ROUTES[bunPattern][``] ??= RES404;
	if (isWildcard) (ROUTES[bunPattern === `/*` ? `/` : bunPattern.slice(0, -3)] ??= {})[method] ??= RES404;
};
let routerToString = () => {
	let str = `{`;
	for (let pattern in ROUTES) {
		str += `"` + pattern + `":`;
		let methods = ROUTES[pattern];
		let allMethods = methods[``];
		if (allMethods == null) {
			str += `{`;
			for (let method in methods) str += method + `:` + methods[method] + `,`;
			str += `},`;
		} else if (Object.keys(methods).length === 1) str += methods[``] + `,`;
		else {
			str += `(r,s)=>`;
			for (let method in methods) if (method !== ``) {
				let fn = methods[method];
				str += `r.method==="` + method + `"?` + (fn.startsWith(`(r,s)=>`) ? injectDependency(fn) + `(r,s)` : fn) + `:`;
			}
			str += (allMethods.startsWith(`(r,s)=>`) ? injectDependency(allMethods) + `(r,s)` : allMethods) + `,`;
		}
	}
	return str + `}`;
};

//#endregion
//#region ../../node_modules/@mapl/web/compiler/bun/jit.js
let compileToState = (router) => {
	resetRouter();
	setCompileHandlerHook((handler, prevContent, path, scope) => {
		let fn = handler[2];
		let call = injectExternalDependency(fn) + `(`;
		let paramCount = countParams(handler[1]);
		paramCount > 0 && (call += paramArgs[paramCount]);
		if (fn.length > paramCount) {
			call += paramCount === 0 ? `c` : `,c`;
			if (!scope[1]) {
				insertRoute(handler[0], path, prevContent + contextInit + compileReturn(handler[3], fn instanceof AsyncFunction, scope[0], true, call + `)`) + (scope[0] ? `})()` : ``));
				return;
			}
		}
		insertRoute(handler[0], path, prevContent + compileReturn(handler[3], fn instanceof AsyncFunction, scope[0], scope[1], call + `)`) + (scope[0] ? `})()` : ``));
	});
	setCompileErrorHandlerHook(compileErrorHandler);
	setContextInit(`let h=[],c={status:200,req:r,headers:h,server:s};`);
	compileGroup(router, [
		false,
		false,
		,
		`return ` + RES400,
		false
	], ``, ``);
};
let compileToString = (router) => {
	compileToState(router);
	return routerToString();
};
let compileToExportedDependency = (router) => exportDependency(injectDependency(compileToString(router)));
let compileToHandlerSync = (router) => {
	let id = compileToExportedDependency(router);
	evaluateSync();
	return getDependency(id);
};

//#endregion
//#region server_dev.js
var server_dev_default = {
	routes: compileToHandlerSync(server_default),
	...void 0
};

//#endregion
export { server_dev_default as default };