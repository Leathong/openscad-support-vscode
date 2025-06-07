import * as vscode from 'vscode';

export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

/**
 * Manages preview webview panels
 */
export class PreviewPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: PreviewPanel | undefined;

	public static readonly viewType = "scad-lsp.preview-panel";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (PreviewPanel.currentPanel) {
			PreviewPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			PreviewPanel.viewType,
			'OpenSCAD Preview',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			() => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		PreviewPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.title = "OpenSCAD Preview";
		this._panel.webview.html = this._getHtmlForWebview(webview, this._panel.viewColumn);
	}

	private _getHtmlForWebview(webview: vscode.Webview, column?: vscode.ViewColumn) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview', 'main.js');
		const modelViewerPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview', 'model-viewer.min.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		const modelViewerUri = webview.asWebviewUri(modelViewerPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview','reset.css');
		const stylesPathVSCodePath = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview','vscode.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview','main.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesVSCodeUri = webview.asWebviewUri(stylesPathVSCodePath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Local path to other assets
		const skyboxLights = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview','skybox-lights.jpg');
		const axes = vscode.Uri.joinPath(this._extensionUri, 'media', 'preview','axes.glb');

		const skyboxLightsUri = webview.asWebviewUri(skyboxLights);
		const axesUri = webview.asWebviewUri(axes);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesVSCodeUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>OpenSCAD Preview</title>
			</head>
			<body>
				<div id="openscad-preview">
					<img id="loading-image"/>
					<model-viewer
						id="preview-model"
						orientation="0deg -90deg 0deg"
						class="main-viewer"
						environment-image="${skyboxLightsUri}"
						max-camera-orbit="auto 180deg auto"
						min-camera-orbit="auto 0deg auto"
						camera-controls
						ar
					>
						<span slot="progress-bar"></span>
					</model-viewer>
					<model-viewer
						id="model-axes"
						orientation="0deg -90deg 0deg"
						src="${axesUri}"
						loading="eager"
						// interpolation-decay="0"
						environment-image="${skyboxLightsUri}"
						max-camera-orbit="auto 180deg auto"
						min-camera-orbit="auto 0deg auto"
						orbit-sensitivity="5"
						interaction-prompt="none"
						camera-controls="false"
						disable-zoom
						disable-tap 
						disable-pan
					>
						<span slot="progress-bar"></span>
					</model-viewer>
				</div>
				<!-- <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js" defer></script> -->
				<script type="module" nonce="${nonce}" src="${modelViewerUri}"></script>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>`;
	}
}
function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
