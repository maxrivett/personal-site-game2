.PHONY: all

all:
	cd src && tsc
	npm run build
	http-server