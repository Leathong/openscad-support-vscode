import { promises as fsPromises } from "fs";
import { dirname, join as joinPath, extname } from "path";
import getOpenSCAD from "../../openscad-wasm/openscad.js";
import { addFonts } from "../../openscad-wasm/openscad.fonts.js";
import { addMCAD } from "../../openscad-wasm/openscad.mcad.js";
import { exportGlb, parseOff } from './export_glb';

// This file is run as a child process inside previewPanel
const [modelPath, tmpDir, previewModelName] = process.argv.slice(2);
render(modelPath, tmpDir, previewModelName).catch(e => {
    console.error(e);
    // TODO: more elegant handling
    throw e;
}).then(() => {
    process.exit(0);
});

async function render(modelPath: string, tmpDir: string, previewModelName: string) {
    // TODO: these could theoretically be pulled up into the API if needed
    const isPreview = true;
    const vars = {};
    const features: string[] = [];
    const extraArgs: string[] = [];

    const openSCADInstance = await getOpenSCAD({
        noInitialRun: true,
        print: (text) => {
            console.debug('stdout: ' + text);
        },
        printErr: (text) => {
            console.debug('stderr: ' + text);
        },
    });
    addFonts(openSCADInstance, tmpDir);
    addMCAD(openSCADInstance, tmpDir);

    const prefixLines: string[] = [];
    if (isPreview) {
        // TODO: add render-modifiers feature to OpenSCAD.
        prefixLines.push('$preview=true;');
    }
    if (!modelPath.endsWith('.scad')) throw new Error('First source must be a .scad file, got ' + modelPath + ' instead');

    const oContent = await fsPromises.readFile(modelPath, "utf-8") || "";
    const parentDir = dirname(modelPath);

    const content = [...prefixLines, oContent].join('\n');

    const stem = modelPath.replace(/\.scad$/, '').split('/').pop();
    const outFile = joinPath(tmpDir, `${stem}.off`);
    const inFile = joinPath(parentDir, `${stem}-tmp${extname(modelPath)}`);

    await fsPromises.writeFile(inFile, content);
    openSCADInstance.callMain([
        inFile,
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
