npm install
npm run build
sudo cp /var/osb/action-button/support/bin.sh /bin/button
sudo chmod +x /bin/button
sudo service button stop

sudo cp /var/osb/action-button/support/init.sh /etc/init.d/button
sudo chmod +x /etc/init.d/button

sudo systemctl daemon-reload

sudo service button start