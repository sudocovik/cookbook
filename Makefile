.PHONY: build

build:
	docker build . -o "type=local,dest=dist" --target output