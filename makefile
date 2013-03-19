REPORTER = spec # list

all: test

test: test-node

test-node:
	@./node_modules/.bin/mocha --reporter $(REPORTER) ./test/*.js || true
	@echo 'done'

.PHONY: test
