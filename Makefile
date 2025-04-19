PUB_FLAG ?= ''

build: cleanup
	vsce package ${PUB_FLAG}

cleanup:
	find ./ -name openscad-language-support-*.vsix | xargs rm

install: build
	code --install-extension $(shell find ./ -name openscad-language-support-*.vsix)

publish: build
	vsce publish ${PUB_FLAG}
	ovsx publish ${PUB_FLAG} $(shell find ./ -name openscad-language-support-*.vsix) -p ${OVSX_TOKEN}

copy_debug_file:
	cp  ../openscad-lsp/target/debug/openscad-lsp ../openscad-lsp/target/release/openscad-lsp

debug: copy_debug_file install