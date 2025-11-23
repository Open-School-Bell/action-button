#!/bin/bash
ret=$(pwd)
cd /var/osb/action-button
node /var/osb/action-button/lib/bin.js $@
rm /var/osb/action-button/button.pid 2> /dev/null
cd $ret