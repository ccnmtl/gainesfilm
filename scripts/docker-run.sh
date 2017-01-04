#!/bin/sh
echo $SERVER_NAME
sed -i "s!SERVER_NAME!$SERVER_NAME!" /etc/apache2/sites-available/000-default.conf
apache2 -DFOREGROUND
