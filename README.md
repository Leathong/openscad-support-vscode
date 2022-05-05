# OpenSCAD Language Support

Visual Studio Code extension utilizing the [OpenSCAD language server](https://github.com/Leathong/openscad-LSP.git)， provide language support for OpenSCAD. The extension avalible on Mac and Windows. There is a server on linux, but not tested. If you like this extension, please light up the stars in GitHub.

Project is available at: <https://github.com/Leathong/openscad-support-vscode>  
The language server is write in rust, project at <https://github.com/Leathong/openscad-LSP.git>

## Features

- jump to definition
- code auto-completion
- include auto-completion
- document symbos (*cmd + shift + o* on Mac)
- hover information
- simple error diagnosis
- preview and CheatSheet (from [OpenSCAD language server](https://github.com/Leathong/openscad-LSP.git))


## TODO
- add a formatter. 
- symbol rename.

## Usage

The extension will read OPENSCADPATH Environment Variable to point to the library(s), you can also add paths to the setting `openscad.LSP.searchPaths`.

For more information, see: [Using an external Editor with OpenSCAD](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_an_external_Editor_with_OpenSCAD)


