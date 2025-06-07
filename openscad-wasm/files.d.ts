import { FS } from "./openscad";
export declare function writeFile(fs: FS, filePath: string, contents: string): void;
export declare function writeFolder(fs: FS, base: string, contents: Record<string, string>): void;
