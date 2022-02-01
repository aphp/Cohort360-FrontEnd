npm config set proxy http://$PROXY_URL
npm install
npm run start > file.log 2>&1 &
sleep 30

echo "1"
ls /etc/
echo "2"
ls /etc/nginx
echo "3"
ls /etc/nginx/conf.d/
echo "4"
cp .gitlab/nginx-test.conf /etc/nginx/conf.d/nginx.conf
echo /etc/nginx/conf.d/nginx.conf
export $(cat $(printenv | grep -E "\b""$CI_COMMIT_BRANCH""_ENV""\b" | cut -d '=' -f 2-) | xargs)
bash docker/entry-point.sh
echo /etc/nginx/conf.d/nginx.conf
nginx

