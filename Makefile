IMG := tools-server
TAG := latest

.PHONY: build run up clean

build:
	docker build \
		--file docker/Dockerfile \
		--tag $(IMG):$(TAG) \
		.

run:
	docker run --rm -it -p 8080:80 --name $(IMG) $(IMG):$(TAG)

up: build run
