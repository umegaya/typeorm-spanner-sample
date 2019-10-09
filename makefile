CRED=
NODE=$(shell n bin 10.16.0)

.PHONY: test
test:
	#GOOGLE_APPLICATION_CREDENTIALS=$(CRED) $(NODE) ./build/compiled/index.js
	$(NODE) ./build/compiled/transform.js


dev:
	npx tsc -w
