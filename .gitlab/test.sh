cp .gitlab/nginx-test.conf /etc/nginx/conf.d/nginx.conf
export $(cat $(printenv | grep -E "\b""$CI_COMMIT_BRANCH""_ENV""\b" | cut -d '=' -f 2-) | xargs)
export $(cat $(printenv | grep -E "\b""$CI_COMMIT_BRANCH""_build_ENV""\b" | cut -d '=' -f 2-) | xargs)
bash docker/entry-point.sh
service nginx restart
npm config set proxy http://$PROXY_URL
npm install
npm run start > file.log 2>&1 &
sleep 30