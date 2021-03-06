STAGING_URL=https://gainesfilm.stage.ccnmtl.columbia.edu/
PROD_URL=https://gainesfilm.ccnmtl.columbia.edu/
STAGING_BUCKET=gainesfilm.stage.ccnmtl.columbia.edu
PROD_BUCKET=gainesfilm.ccnmtl.columbia.edu
INTERMEDIATE_STEPS ?= make $(PUBLIC)/js/all.json
APP=gainesfilm

JS_FILES=static/js/src

all: jshint jscs

include *.mk

$(PUBLIC)/js/all.json: $(PUBLIC)/json/all/index.html
	mkdir $(PUBLIC)/js/ || true
	cp $< static/js/all.json
	mv $< $@ && ./checkjson.py
