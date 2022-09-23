build: cleanup
	vsce package 

cleanup:
	find ./ -name openscad-language-support-*.vsix | xargs rm

install: build
	code --install-extension $(shell find ./ -name openscad-language-support-*.vsix)

publish: build
	vsce publish
	npm ovsx publish $(shell find ./ -name openscad-language-support-*.vsix) -p ${OVSX_TOKEN}

copy_debug_file:
	cp  ../openscad-lsp/target/debug/openscad-lsp ../openscad-lsp/target/release/openscad-lsp

debug: copy_debug_file install