SRCS_JS = $(wildcard src/*.js) $(wildcard src/*/*.js)

dist: dist/index.html dist/favicon.png dist/script.js dist/explosion.mp3
.PHONY: dist

distmin: dist/index.html dist/favicon.png dist/script.min.js dist/explosion.mp3
	mv dist/script.min.js dist/script.js
.PHONY: distmin

clean:
	rm dist/script.js
.PHONY: clean

deploy: distmin
	mv dist/* .
	rm -rf $(filter-out . .. .git index.html script.js LICENSE,$(wildcard *) $(wildcard .*))
.PHONY: deploy

dist/script.js: $(SRCS_JS)
	npx rollup -f iife -o $@ src/script.js

dist/script.min.js: dist/script.js
	npx terser $< --compress --mangle -o $@
