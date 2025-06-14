/*---------------------------------------------------------------------------------------------
 * Preview Manager
 *
 * Class for adding / removing OpenSCAD previews to a previewStore
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { ScadConfig, DEBUG } from './config';
import { ExternalPreview } from './externalPreview';
import { PreviewStore } from './previewStore';
import { PreviewPanel } from './previewPanel';

// PreviewItems used for `scad.kill` quick pick menu
class PreviewItem implements vscode.QuickPickItem {
    label: string; // File name
    description: string; // File path
    uri: vscode.Uri; // Raw file uri

    constructor(public preview: ExternalPreview) {
        const fileName = path.basename(preview.uri.fsPath);
        this.label =
            (preview.previewType === 'output' ? 'Exporting: ' : '') +
            (fileName ? fileName : ''); // Remove path before filename
        this.description = preview.uri.path.substring(1); // Remove first '/'
        this.uri = preview.uri;
    }
}

class MessageItem implements vscode.QuickPickItem {
    label: string;

    constructor(public message: string) {
        this.label = message;
    }
}

// Launcher class to handle launching instance of scad
export class PreviewManager {
    private previewStore = new PreviewStore();
    private config: ScadConfig = {};
    private extensionPath: vscode.Uri | undefined;

    public setContext(context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionUri;
    }

    // Opens file in OpenSCAD
    public openFile(
        mainUri?: vscode.Uri,
        allUris?: vscode.Uri[],
        args?: string[]
    ): void {
        (Array.isArray(allUris) ? allUris : [mainUri]).forEach(async (uri) => {
            let resource: vscode.Uri;

            if (DEBUG) console.log(`openFile: { main: ${mainUri}, all: ${allUris}, args: ${args}}`);   // DEBUG

            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) {
                const newUri = await this.getActiveEditorUri();
                if (newUri) resource = newUri;
                else return;
            }
            // Uri is given, set `resource`
            else resource = uri;

            if (DEBUG) console.log(`uri: ${resource}`); // DEBUG

            if (this.config.inlinePreview) {
                PreviewPanel.createOrShow(this.extensionPath!);
                await PreviewPanel.currentPanel?.previewModel(resource.fsPath);
            } else {
                // Check if a new preview can be opened
                if (!this.canOpenNewExternalPreview(resource, args)) return;
    
                // Create and add new OpenSCAD preview to PreviewStore
                this.previewStore.createAndAdd(resource, args);
            }
        });
    }

    // Constructor
    public constructor() {
        // Load configuration
        this.onDidChangeConfiguration(
            vscode.workspace.getConfiguration('openscad')
        );
    }

    // Run when change configuration event
    public onDidChangeConfiguration(
        config: vscode.WorkspaceConfiguration
    ): void {
        // Update configuration
        this.config.openscadPath = config.get<string>('launchPath');
        this.config.inlinePreview = config.get<boolean>('inlinePreview');

        // Only update openscad path if the path value changes
        if (this.config.lastOpenscadPath !== this.config.openscadPath) {
            this.config.lastOpenscadPath = this.config.openscadPath; // Set last path
            ExternalPreview.setScadPath(this.config.openscadPath); // Update path
        }

        // Set the max previews
        this.previewStore.maxPreviews = 0;
    }

    // Gets the uri of the active editor
    private async getActiveEditorUri(): Promise<vscode.Uri | undefined> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return undefined;

        // Make user save their document before previewing if it is untitled
        // TODO: Consider implementing as virtual (or just temp) document in the future
        if (editor.document.isUntitled) {
            vscode.window.showInformationMessage(
                'Save untitled document before previewing'
            );
            // Prompt save window
            const savedUri = await vscode.window.showSaveDialog({
                defaultUri: editor.document.uri,
                filters: { 'OpenSCAD Designs': ['scad'] },
            });
            // If user saved, set `resource` otherwise, return
            if (savedUri) return savedUri;
            else return undefined;
        }
        // If document is already saved, set `resource`
        else return editor.document.uri;
    }


    // Returns if the current URI with arguments (output Y/N) can be opened
    private canOpenNewExternalPreview(resource: vscode.Uri, args?: string[]): boolean {
        // Make sure path to openscad.exe is valid
        if (!ExternalPreview.isValidScadPath) {
            if (DEBUG)
                console.error(
                    `Path to openscad command is invalid: "${ExternalPreview.scadPath}"`
                ); // DEBUG
            vscode.window.showErrorMessage(
                `Cannot find the command: "${ExternalPreview.scadPath}". Make sure OpenSCAD is installed. You may need to specify the installation path under \`Settings > OpenSCAD > Launch Path\``
            );
            return false;
        }

        // Make sure we don't surpass max previews allowed
        if (
            this.previewStore.size >= this.previewStore.maxPreviews &&
            this.previewStore.maxPreviews > 0
        ) {
            if (DEBUG)
                console.error('Max number of OpenSCAD previews already open.'); // DEBUG
            vscode.window.showErrorMessage(
                'Max number of OpenSCAD previews already open. Try increasing the max instances in the config.'
            );
            return false;
        }

        // Make sure file is not already open
        else if (
            this.previewStore.get(
                resource,
                PreviewStore.getPreviewType(args)
            ) !== undefined
        ) {
            if (DEBUG)
                console.log(`File is already open: "${resource.fsPath}"`);
            vscode.window.showInformationMessage(
                `${path.basename(resource.fsPath)} is already open: "${
                    resource.fsPath
                }"`
            );
            return false;
        } else return true;
    }
}
