import { DEBUG, type PreviewTheme, type ScadConfig } from "../config";
import { promises as fsPromises } from "fs";
import { join as joinPath } from "path";
import getOpenSCAD from "../../openscad-wasm/openscad.js";
import { exportGlb, parseOff } from './export_glb';

// This file is run as a child process inside previewPanel
const [modelPath, tmpDir, previewModelName, libraryDir, configJSON] = process.argv.slice(2);
render(modelPath, tmpDir, previewModelName, libraryDir, configJSON).catch(e => {
    console.error(e);
    // TODO: more elegant handling
    throw e;
}).then(() => {
    process.exit(0);
});

async function render(modelPath: string, tmpDir: string, previewModelName: string, libraryDir: string, configJSON: string) {
    if (!modelPath.endsWith('.scad')) throw new Error('Render source must be a .scad file, got ' + modelPath + ' instead');

    const config: ScadConfig = JSON.parse(configJSON);
    // TODO: these could theoretically be pulled up into the API if needed
    const vars = {
        "$preview": true
    };
    const features: string[] = [];
    const extraArgs: string[] = [];

    const openSCADInstance = await getOpenSCAD({
        noInitialRun: true,
        print: (text) => {
            process.stdout.write(text);
        },
        printErr: (text) => {
            process.stderr.write(text);
        },
        preRun: [(runtime) => {
            const paths = [libraryDir];
            if (process.env.OPENSCADPATH) {
                paths.push(process.env.OPENSCADPATH);
            }
            if (config.openscadPath) {
                paths.push(config.openscadPath);
            }
            runtime.ENV.OPENSCADPATH = paths.join(":");
        }]
    });

    const stem = modelPath.replace(/\.scad$/, '').split('/').pop();
    const outFile = joinPath(tmpDir, `${stem}.off`);

    // https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_OpenSCAD_in_a_command_line_environment
    openSCADInstance.callMain([
        modelPath,
        "-o", outFile,
        "--backend=manifold",
        "--export-format=off",
        ...(Object.entries(vars ?? {}).flatMap(([k, v]) => [`-D${k}=${formatValue(v)}`])),
        ...(features ?? []).map(f => `--enable=${f}`),
        ...(extraArgs ?? [])
    ]);
    const modelContent = await fsPromises.readFile(outFile, "utf-8");
    const glbModelData = await exportGlb(parseOff(modelContent));
    await fsPromises.writeFile(joinPath(tmpDir, previewModelName), glbModelData);
}

function formatValue(any: any): string {
    if (typeof any === 'string') {
        return `"${any}"`;
    } else if (any instanceof Array) {
        return `[${any.map(formatValue).join(', ')}]`;
    } else {
        return `${any}`;
    }
}
