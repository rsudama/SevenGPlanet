/// READ THIS !!!
http://www.kevwebdev.com/blog/setting-up-a-symfony2-project-in-phpstorm.html#framework-support

// make sure composer is up to date
composer self-update

// create a symfony project
composer create-project symfony/framework-standard-edition {./project-folder} ~2.4

// do this after creating the project so it is based on the composer.json
composer update --prefer-dist --dev

// run composer diagnostic - note: platform settings may FAIL because xdebug is enabled,
// but all other settings should be OK
composer diagnose

// set up database connection parameters by editing bootstrap_doctrine.php

// create a database to use (doctrine requires this)
php app/console doctrine:database:create

// create the database schema
php vendor/doctrine/orm/bin/doctrine orm:schema-tool:create

// force an update to the database schema
php vendor/doctrine/orm/bin/doctrine orm:schema-tool:update --force

// copy resource files (css, js, images) to the web folder
// (note: add --symlink to set dynamic updates; but requires admin privs on Windows)
php app/console assets:install web/

// run app in web server for debug
//php app/console server:run
Tools/Web Server
then
Run/Debug/MapInsight

// connect to app
http://localhost:8000

// clear the cache
php app/console cache:clear --env=dev --no-debug
or
php app/console cache:clear --env=prod --no-debug

// update git files on server
git pull

// run composer on server (out of memory)
php -d memory_limit=-1 /usr/local/bin/composer update
or
php /etc/php5/cli/composer/phar install

// set permissions on server
sudo chown -R :www-data app/cache app/logs
sudo chmod -R 777 app/cache
sudo chmod -R 777 app/logs
or
sudo chmod g+s app/cache app/logs

// add a log statement
$this->get('monolog.logger.my_channel')->info('...');
