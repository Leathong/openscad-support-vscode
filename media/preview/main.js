//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || {};

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {

        }
    });

    /** 
     * @param {string} color 
     */
    function onAction(color) {
        vscode.postMessage({ type: 'todo', value: color });
    }
}());
