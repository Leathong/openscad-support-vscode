export {};

declare global {
    type OpenSCADPreviewState = {};
    type VSCodeHostMessage = {type: string, value: any};

    function acquireVsCodeApi(): {
        getState(): OpenSCADPreviewState;
        setState(state: OpenSCADPreviewState): void;
        postMessage(message: VSCodeHostMessage): void;
    };
}
