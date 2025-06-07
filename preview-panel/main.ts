import {initViewer} from "./viewer";

const vscode = acquireVsCodeApi();

const oldState = vscode.getState() || {};

// Handle messages sent from the extension to the webview
window.addEventListener("message", (event) => {
  const message = event.data; // The json data that the extension sent
  switch (message.type) {
  }
});

function onAction() {
  vscode.postMessage({ type: "todo", value: "todo" });
}

const main = () => {
    initViewer();
}

window.addEventListener("load", () => main())
