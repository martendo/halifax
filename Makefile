SRCS = $(wildcard src/*) $(wildcard src/*/*)

test: $(SRCS)
	@mkdir -p test
	cp src/index.html test
	npx rollup -f iife -o test/script.js src/main.js

deploy: $(SRCS)
	cp src/index.html .
	npx rollup -f iife -o script.js src/main.js
	rm -rf $(filter-out index.html script.js LICENSE,$(wildcard *))

clean:
	rm -rf test
