/// <reference types="./openscad.d.ts" />
let wasmModule;
async function OpenSCAD(options) {
    if (!wasmModule) {
        const url = new URL(`./openscad.wasm.js`, import.meta.url).href;
        const request = await fetch(url);
        wasmModule = "data:text/javascript;base64," + btoa(await request.text());
    }
    const module = {
        noInitialRun: true,
        locateFile: (path) => new URL(`./${path}`, import.meta.url).href,
        ...options,
    };
    globalThis.OpenSCAD = module;
    await import(wasmModule + `#${Math.random()}`);
    delete globalThis.OpenSCAD;
    await new Promise((resolve) => {
        module.onRuntimeInitialized = () => resolve(null);
    });
    return module;
}

export { OpenSCAD as default };
