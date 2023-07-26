#!/bin/bash

export NODE_ENV='production';

sudo kill -2 `ps -ef | grep "sudo node \/" | awk {'print $2'}` 2> /dev/null;
git pull && npm install;
sudo node ~/art-bounty/server.js >> ~/logs/$(date +%F)-node.log 2>&1 &
