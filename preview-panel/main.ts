import "@google/model-viewer";
import { initViewer } from './viewer';

const vscode = acquireVsCodeApi();

const oldState = vscode.getState() || {};

let updateModel = (uri: string) => { }

// Handle messages sent from the extension to the webview
window.addEventListener('message', (event) => {
	const d = event.data as VSCodeHostMessage;
	switch (d.type) {
		case "Model":
			vscode.setState({ modelURI: d.value });
			updateModel(d.value);
			break;
	}
});

const main = () => {
	updateModel = initViewer();
	if (oldState.modelURI) {
		updateModel(oldState.modelURI);
	}
	vscode.postMessage({ type: "Ready" });
};

if (document.readyState === 'loading') {
	// Loading hasn't finished yet
	document.addEventListener('DOMContentLoaded', () => main());
} else {
	// `DOMContentLoaded` has already fired
	main();
}
