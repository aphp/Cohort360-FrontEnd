npm config set proxy http://$PROXY_URL
npm install
npm run start > file.log 2>&1 &
sleep 30

cp .gitlab/nginx-test.conf /etc/nginx/conf.d/nginx.conf
cat /etc/nginx/conf.d/nginx.conf
export $(cat $(printenv | grep -E "\b""$CI_COMMIT_BRANCH""_ENV""\b" | cut -d '=' -f 2-) | xargs)
bash docker/entry-point.sh
cat /etc/nginx/conf.d/nginx.conf
service nginx restart
echo "done"
