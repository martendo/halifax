SRCS_JS = $(wildcard src/*.js) $(wildcard src/*/*.js)

dist: dist/index.html dist/favicon.png dist/script.js
.PHONY: dist

distmin: dist/index.html dist/favicon.png dist/script.min.js
	mv dist/script.min.js dist/script.js
.PHONY: distmin

clean:
	rm -rf dist
.PHONY: clean

deploy: distmin
	mv dist/* .
	rm -rf $(filter-out . .. .git index.html script.js LICENSE,$(wildcard *) $(wildcard .*))
.PHONY: deploy

dist/script.js: $(SRCS_JS)
	@mkdir -p $(@D)
	npx rollup -f iife -o $@ src/script.js

dist/script.min.js: dist/script.js
	npx terser $< --compress --mangle -o $@

dist/index.html: src/index.html
	@mkdir -p $(@D)
	cp $< $(@D)

dist/favicon.png: src/favicon.png
	@mkdir -p $(@D)
	cp $< $(@D)
