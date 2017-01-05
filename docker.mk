ORG ?= ccnmtl

# make it easy to override the docker image created. eg:
#     REGISTRY=localhost:5000/ TAG=release-5 make build
# to make an image 'localhost:5000/ccnmtl/app:release-5'
# defaults to docker hub (ie, no registry specified) and no tag.

ifeq ($(origin TAG), undefined)
	IMAGE ?= $(REGISTRY)$(ORG)/$(APP)
else
	IMAGE ?= $(REGISTRY)$(ORG)/$(APP):$(TAG)
endif

build:
	docker build -t $(IMAGE) .

.PHONY: build
