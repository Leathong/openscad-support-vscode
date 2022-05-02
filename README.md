# OpenSCAD for VS Code

This extension isnpired by and build upon [Antyos/vscode-openscad](https://github.com/Antyos/vscode-openscad).

The main work is to add a language server, so that the extension can auto-complete code and paths, jump to definitions, and display function/module signatures when the mouse hovers, almost everything you need.

The extension avalible on Mac and Windows.

The next thing is add a formatter. If you like this extension, please light up the stars in GitHub.

Project is available at: <https://github.com/Leathong/openscad-support-vscode>

The language server is write in rust, project at <https://github.com/Leathong/openscad-LSP.git>

## Usage

The extension will read OPENSCADPATH Environment Variable to point to the library(s), you can also add paths to the setting `openscad.LSP.searchPaths`.

For more information, see: [Using an external Editor with OpenSCAD](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_an_external_Editor_with_OpenSCAD)


