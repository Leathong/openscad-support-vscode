# OpenSCAD Language Support

marketplace: [[OpenSCAD Language Support](https://marketplace.visualstudio.com/items?itemName=Leathong.openscad-language-support)]

Visual Studio Code extension utilizing the [OpenSCAD language server](https://github.com/Leathong/openscad-LSP.git)， provide language support for OpenSCAD. The extension avalible on Mac, Linux and Windows. If you like this extension, please light up the stars in GitHub.

Project is available at: <https://github.com/Leathong/openscad-support-vscode>  
The language server is write in rust, project at <https://github.com/Leathong/openscad-LSP.git>

## Features

- builtin function/module documents
- formatter, you need install clang-format yourself
- jump to definition
- code auto-completion</br>
  <img src="./media/snapshot_suggest.png#gh-light-mode-only" width="70%">
- path auto-completion</br>
  <img src="./media/snapshot_path.png#gh-light-mode-only" width="70%">
- document symbols (*cmd + shift + o* on Mac)
- hover information</br>
  <img src="./media/snapshot_hover.png#gh-light-mode-only" width="70%">
- simple error diagnosis
- preview and CheatSheet (from [vscode-openscad](https://github.com/Antyos/vscode-openscad))

## Settings

- **scad-lsp.searchPaths**:</br>
  The extension will read OPENSCADPATH Environment Variable to point to the library(s), or you can set search paths by this property.

- **scad-lsp.launchPath**:</br>
  Command to launch `openscad`. Either the path to the openscad executable, or just \"`openscad`\" (no quotes) if the executable is in the path. If left blank, it will use the default path for your system noted below:
  - Windows: `C:\\Program Files\\Openscad\\openscad.exe`
  - MacOS: `/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD` 
  - Linux: `openscad` (Automatically in path).

- **scad-lsp.fmtStyle**:</br>
  clang format style, options: LLVM, GNU, Google, Chromium, Microsoft, Mozilla, WebKit, file. If you'd like to customize your style, set this property to `file`, and place your `.clang-format` file to your source code directory.

- **scad-lsp.fmtExePath**:</br>
  clang format executable path.

- **scad-lsp.defaultParam**:</br>
  if true, will include defualt params in auto-completion.

## TODO
- symbol rename.

For more information, see: [Using an external Editor with OpenSCAD](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_an_external_Editor_with_OpenSCAD)


