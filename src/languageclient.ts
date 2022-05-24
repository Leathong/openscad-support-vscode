import * as vscode from 'vscode';
import * as languageclient from 'vscode-languageclient/node';
import * as net from 'net';
import * as child from 'child_process';
import * as path from 'path';
import * as process from 'process'

export class ScadClient {
    private static langclient: languageclient.LanguageClient;
    private static server: child.ChildProcess;
    private static clientReady = false;
    private static outputChannel = vscode.window.createOutputChannel(
        'OpenSCAD-LSP'
    );
    public static startLanguageClient(context: vscode.ExtensionContext): void {

        const outputChannel: vscode.OutputChannel = this.outputChannel;

        let serverPath: string;

        let plat = process.platform;

        if (plat == 'darwin') {
            serverPath = path.join(context.extensionPath, "server/openscad-language-server");
        } else if (plat == 'linux') {
            serverPath = path.join(context.extensionPath, "server/openscad-language-server-linux");
        } else {
            serverPath = path.join(context.extensionPath, "server/openscad-language-server.exe");
        }

        this.server = child.spawn(serverPath);

        this.server.stderr?.on('data', function (data: Buffer) {
            outputChannel.append(
                data.toString()
            );
        });

        this.server.stdout?.on('data', (data: Buffer) => {
            outputChannel.append(
                data.toString()
            );
            this.starClient();
        });

        // this.starClient();
    }

    static starClient() {
        if (!this.langclient) {
            const outputChannel: vscode.OutputChannel = this.outputChannel;

            const connectionInfo: net.TcpSocketConnectOpts = {
                port: 3245, // 0xcad
                host: 'localhost',
            };

            const serverOptions = () => {
                // Connect to language server via socket
                const socket = net.connect(connectionInfo);
                const result: languageclient.StreamInfo = {
                    writer: socket,
                    reader: socket,
                };

                outputChannel.appendLine(
                    '[client] Connecting to openscad on port ' + connectionInfo.port
                );
                console.log(
                    'Opening connection to ',
                    connectionInfo.host + ':' + connectionInfo.port
                );

                return Promise.resolve(result);
            };

            // Options to control the language client
            const clientOptions: languageclient.LanguageClientOptions = {
                documentSelector: [{ scheme: 'file', language: 'scad' }],
                synchronize: {},
                outputChannel,
                outputChannelName: 'OpenSCAD',
                revealOutputChannelOn: languageclient.RevealOutputChannelOn.Info,
            };

            // Create the language client and start the client.
            this.langclient = new languageclient.LanguageClient(
                'openscad-lsp',
                'OpenSCAD Language Server',
                serverOptions,
                clientOptions
            );
            this.langclient.registerProposedFeatures();

            // enable tracing (.Off, .Messages, Verbose)
            this.langclient.trace = languageclient.Trace.Verbose;

            this.langclient.onReady().then(() => {
                outputChannel.appendLine('[client] Connection has been established');
            });

            this.langclient.start();

            this.langclient.onReady().then(() => {
                this.clientReady = true;
                this.onDidChangeConfiguration();
            });
        }
    }

    public static onDidChangeConfiguration(config?: vscode.WorkspaceConfiguration) {
        if (!config) {
            config = vscode.workspace.getConfiguration('scad-lsp');
        }
        if (this.clientReady && config) {
            let libs = config.get<string>("searchPaths");
            let fmt_style = config.get<string>("fmt_style");
            let fmt_exe = config.get<string>("fmt_exePath");
            
            let value = {
                settings: {
                    openscad: {
                        search_paths: libs,
                        fmt_exe: fmt_exe,
                        fmt_style: fmt_style
                    }
                }
            }
            let valueString = JSON.stringify(value);
            this.langclient.sendNotification("workspace/didChangeConfiguration", value);
        }
    }

    public static stopLanguageServer(): Thenable<void> | undefined {
        if (this.server) {
            this.server.kill('SIGINT');
        }

        return this.langclient.stop();
    }
}