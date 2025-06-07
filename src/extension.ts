/*---------------------------------------------------------------------------------------------
 * Extension
 *
 * Main file for activating extension
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Cheatsheet } from './cheatsheet';
import { PreviewManager } from './previewManager';
import { ScadClient } from './languageclient';
import { DEBUG } from './config';
import { getWebviewOptions, PreviewPanel } from './previewPanel';

// New launch object
const previewManager = new PreviewManager();

// Called when extension is activated
export function activate(context: vscode.ExtensionContext): void {
    console.log('Activating openscad extension');

    previewManager.setContext(context);

    if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(PreviewPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				PreviewPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () =>
            Cheatsheet.createOrShowPanel(context.extensionPath)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'scad-lsp.preview',
            (mainUri, allUris) => previewManager.openFile(mainUri, allUris)
        )
    );

    // Register status bar item
    context.subscriptions.push(Cheatsheet.getStatusBarItem());

    // Register listeners to make sure cheatsheet items are up-to-date
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor)
    );
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration)
    );
    onDidChangeConfiguration();

    // Update status bar item once at start
    Cheatsheet.updateStatusBar();

    // Register serializer event action to recreate webview panel if vscode restarts
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in action event
        vscode.window.registerWebviewPanelSerializer(Cheatsheet.viewType, {
            async deserializeWebviewPanel(
                webviewPanel: vscode.WebviewPanel,
                state: unknown
            ) {
                if (DEBUG) console.log(`Got state: ${state}`);
                Cheatsheet.revive(webviewPanel, context.extensionPath);
            },
        });
    }

    ScadClient.startLanguageClient(context);
}

// Called when extension is deactivated
// export function deactivate() {}

// Run on active change text editor
function onDidChangeActiveTextEditor() {
    Cheatsheet.onDidChangeActiveTextEditor();
}

// Run when configuration is changed
function onDidChangeConfiguration() {
    const config = vscode.workspace.getConfiguration('scad-lsp'); // Get new config
    Cheatsheet.onDidChangeConfiguration(config); // Update the cheatsheet with new config
    previewManager.onDidChangeConfiguration(config); // Update launcher with new config
    ScadClient.onDidChangeConfiguration(config);
    // vscode.window.showInformationMessage("Config change!"); // DEBUG
}


export function deactivate(): Thenable<void> | undefined {
    return ScadClient.stopLanguageServer();
}
