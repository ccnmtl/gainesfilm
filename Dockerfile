FROM ccnmtl/apache2-cas
COPY config/apache.conf /etc/apache2/sites-available/000-default.conf
COPY public /var/www/html/
COPY scripts/docker-run.sh /usr/local/bin/docker-run.sh
CMD ["/usr/local/bin/docker-run.sh"]
