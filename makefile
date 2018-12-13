CRED=

.PHONY: test
test:
	GOOGLE_APPLICATION_CREDENTIALS=$(CRED) node ./build/compiled/index.js


dev:
	npx tsc -w
