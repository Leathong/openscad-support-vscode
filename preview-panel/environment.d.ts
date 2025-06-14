export {};

declare global {
    type OpenSCADPreviewState = {
        modelURI?: string
    };
    type VSCodeHostMessage = {type: "Ready"} | {type: "Model", value: string};

    function acquireVsCodeApi(): {
        getState(): OpenSCADPreviewState;
        setState(state: OpenSCADPreviewState): void;
        postMessage(message: VSCodeHostMessage): void;
    };
}
