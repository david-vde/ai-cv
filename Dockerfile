FROM php:8.3-apache

RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

RUN echo '#!/bin/sh\n\
mv /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini.off /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini 2>/dev/null\n\
kill -USR2 1\n\
echo "✅ Xdebug enabled"'\
> /usr/local/bin/xdebug-on && chmod +x /usr/local/bin/xdebug-on

RUN echo '#!/bin/sh\n\
mv /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini.off 2>/dev/null\n\
kill -USR2 1\n\
echo "❌ Xdebug disabled"'\
> /usr/local/bin/xdebug-off && chmod +x /usr/local/bin/xdebug-off

RUN /usr/local/bin/xdebug-off