#!/bin/bash

sudo yum update -y

# Install LAMP
sudo amazon-linux-extras install -y lamp-mariadb10.2-php7.2 php7.2
sudo yum install -y httpd mariadb-server
sudo systemctl start httpd
sudo systemctl enable httpd
sudo usermod -a -G apache ec2-user
sudo chown -R ec2-user:apache /var/www
sudo chmod 2775 /var/www && find /var/www -type d -exec sudo chmod 2775 {} \;
find /var/www -type f -exec sudo chmod 0664 {} \;
sudo systemctl enable mariadb
sudo systemctl start mariadb

# Create user and database
mysql -e "CREATE USER 'wordpress-user'@'localhost' IDENTIFIED BY '$sup3R$tr0ngPa$$';"
mysql -e "CREATE DATABASE `wordpress-db`;"
mysql -e "GRANT ALL PRIVILEGES ON `wordpress-db`.* TO "wordpress-user"@"localhost";"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'R0otP4$$w0rD';"
mysql -e "FLUSH PRIVILEGES;"

# Install WordPress
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
cp wordpress/wp-config-sample.php wordpress/wp-config.php
sed -i 's/database_name_here/wordpress-db/' wordpress/wp-config.php
sed -i 's/username_here/wordpress-user/' wordpress/wp-config.php
sed -i 's/password_here/$sup3R$tr0ngPa$$/' wordpress/wp-config.php

# Install WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
wp config shuffle-salts
