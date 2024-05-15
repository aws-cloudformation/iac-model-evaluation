sudo yum -y update
sudo yum -y install httpd
sudo sed -i 's/Listen 80/Listen 80/' /etc/httpd/conf/httpd.conf
sudo service httpd reload
sudo service httpd start