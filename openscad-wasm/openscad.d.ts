export interface InitOptions {
    noInitialRun: boolean;
}
export interface OpenSCAD {
    callMain(args: Array<string>): number;
    FS: FS;
    locateFile?: (path: string, prefix: string) => string;
    onRuntimeInitialized?: () => void;
}
export interface FS {
    mkdir(path: string): void;
    rename(oldpath: string, newpath: string): void;
    rmdir(path: string): void;
    stat(path: string): unknown;
    readFile(path: string): string | Uint8Array;
    readFile(path: string, opts: {
        encoding: "utf8";
    }): string;
    readFile(path: string, opts: {
        encoding: "binary";
    }): Uint8Array;
    writeFile(path: string, data: string | ArrayBufferView): void;
    unlink(path: string): void;
}
declare function OpenSCAD(options?: InitOptions): Promise<OpenSCAD>;
export default OpenSCAD;
