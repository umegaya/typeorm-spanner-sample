CRED=
NODE=$(shell n bin 8.11.4)

.PHONY: test
test:
	GOOGLE_APPLICATION_CREDENTIALS=$(CRED) $(NODE) ./build/compiled/index.js


dev:
	npx tsc -w
