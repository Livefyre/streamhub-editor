.PHONY: clean dist run test

build:
	npm install

clean:
	rm -rf lib node_modules

dist:
	./node_modules/requirejs/bin/r.js -o ./tools/build.conf.js

run:
	npm start

test:
	npm test
