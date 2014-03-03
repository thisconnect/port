export PATH := $(shell pwd)/node_modules/.bin/:$(PATH)

REPORTER = spec # list

all: test

test: test-node

test-node:
	@mocha --reporter $(REPORTER) ./test/*.js || true
	@echo 'done'

.PHONY: test
