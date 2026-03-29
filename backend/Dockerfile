FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    zip \
    && docker-php-ext-install zip pdo pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Installation de Xdebug
RUN pecl install xdebug && docker-php-ext-enable xdebug

# Configuration forcée de Xdebug (S'exécute au Build)
RUN echo 'zend_extension=xdebug\n\
xdebug.mode=debug,coverage\n\
xdebug.client_host=host.docker.internal\n\
xdebug.start_with_request=yes' > /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# Script pour ACTIVER Xdebug
RUN echo '#!/bin/sh\n\
mv /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini.off /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini 2>/dev/null\n\
kill -USR2 1\n\
echo "✅ Xdebug enabled (Mode: debug,coverage)"'\
> /usr/local/bin/xdebug-on && chmod +x /usr/local/bin/xdebug-on

# Script pour DESACTIVER Xdebug
RUN echo '#!/bin/sh\n\
mv /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini.off 2>/dev/null\n\
kill -USR2 1\n\
echo "❌ Xdebug disabled"'\
> /usr/local/bin/xdebug-off && chmod +x /usr/local/bin/xdebug-off

# Par défaut, on désactive Xdebug au démarrage du conteneur pour la performance
RUN /usr/local/bin/xdebug-off
