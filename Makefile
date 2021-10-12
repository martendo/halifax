SRCS = $(wildcard src/*)

test: $(SRCS)
	@mkdir -p test
	cp $(SRCS) test

deploy: $(SRCS)
	cp $(SRCS) .
	rm -rf $(filter-out LICENSE,$(wildcard *))

clean:
	rm -rf test
	rm -f $(patsubst src/%,%,$(SRCS))
