#!/usr/bin/bash

bash .gitlab/nginx-rename.sh
service nginx restart
sleep infinity
