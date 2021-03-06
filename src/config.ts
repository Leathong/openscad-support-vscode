/*---------------------------------------------------------------------------------------------
 * Config
 *
 * Interface containing all configurations that are used by Typescript parts of extension
 *--------------------------------------------------------------------------------------------*/

// Extension config values
export interface ScadConfig {
    openscadPath?: string;
    lastOpenscadPath?: string;
}

// DEBUG variable. Set to false when compiling for release to disable all console logging
export const DEBUG = false;
