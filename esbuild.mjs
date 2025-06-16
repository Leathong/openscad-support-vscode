#!/usr/bin/env node

import * as esbuild from 'esbuild'

const watch = process.argv.includes("--watch");

const buildContext = await esbuild.context({
  entryPoints: ['preview-panel/main.ts'],
  bundle: true,
  minify: true,
  sourcemap: "inline",
  target: ['chrome58'],
  outfile: 'out/preview/main.js',
})

if (watch) {
  await buildContext.watch();

//   const { host, port } = await buildContext.serve({
//     servedir: "out/preview",
//     port: 8888,
//     cors: {
//       origin: "*",
//     },
//   });
//   console.log(`server started at http://${host}:${port}`);
} else {
  await buildContext.rebuild();
  process.exit(0);
}
