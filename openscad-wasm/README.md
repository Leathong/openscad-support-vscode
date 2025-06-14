# OpenSCAD WASM Dependencies

The files in this directory are created by building [openscad](https://github.com/openscad/openscad) in WASM mode, then copying the built product here.

## Building from source:

- Clone https://github.com/openscad/openscad

Inside the clone:

```bash
./scripts/wasm-base-docker-run.sh emcmake cmake -B build-node -DWASM_BUILD_TYPE=node-module -DCMAKE_BUILD_TYPE=Release -DEXPERIMENTAL=1
./scripts/wasm-base-docker-run.sh cmake --build build-node -j2
```

- `cp build-node/openscad.js ../openscad-support-vscode/openscad-wasm`
    (assuming the repos are in the same parent dir)
