SRCS = $(wildcard src/*) $(wildcard src/*/*)

test: $(SRCS)
	@mkdir -p test
	cp src/index.html src/favicon.png test
	npx rollup -f iife -o test/script.js src/main.js
	npx terser test/script.js --compress --mangle -o test/script.js

deploy: $(SRCS)
	cp src/index.html src/favicon.png .
	npx rollup -f iife -o script.js src/main.js
	npx terser script.js --compress --mangle -o script.js
	rm -rf $(filter-out . .. .git index.html script.js LICENSE,$(wildcard *) $(wildcard .*))

clean:
	rm -rf test
