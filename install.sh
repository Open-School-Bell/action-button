sudo apt-get update
sudo apt-get install -y curl

# Install Nodesource
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
rm nodesource_setup.sh

sudo apt-get install -y nodejs git

currentuser=$(whoami)

sudo addgroup openschoolbell
sudo usermod -a -G openschoolbell $currentuser

sudo mkdir -p /var/osb
sudo chown $currentuser:openschoolbell /var/osb

cd /var/osb

git clone https://github.com/Open-School-Bell/action-button.git

cd /var/osb/action-button

npm install

npm run build

sudo cp /var/osb/action-button/support/bin.sh /bin/button
sudo chmod +x /bin/button

sudo cp /var/osb/button/support/init.sh /etc/init.d/button
sudo chmod +x /etc/init.d/button
sudo update-rc.d button defaults