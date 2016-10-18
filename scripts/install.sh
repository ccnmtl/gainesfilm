#!/bin/bash
virtualenv -p python3 /tmp/ve3
/tmp/ve3/bin/pip install bs4
/tmp/ve3/bin/pip install requests
echo "now you can run /tmp/ve3/bin/python3 scripts/scrape.py"
echo "but don't forget to set GAINES_USER and GAINES_PASSWORD environment variables"
