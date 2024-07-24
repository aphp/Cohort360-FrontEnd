FROM node:20 AS build

COPY package.json package-lock.json ./
COPY src src
COPY public public
RUN npm install
RUN VERSION=$(cat package.json | grep version | head -1 | awk -F= "{ print $2 }" | sed 's/"version"://g' | sed 's/[",]//g' | tr -d '[[:space:]]') CI_COMMIT_SHORT_SHA=$(git rev-parse --short HEAD) echo "{\"commit\": \"$CI_COMMIT_SHORT_SHA\", \"version\": \"$VERSION\"}" > src/data/version.json
RUN npm run build


FROM nginx:1.25.1

WORKDIR /app
COPY --from=build build build

# Configure the nginx inside the docker image
COPY .templates/nginx.conf /etc/nginx/conf.d/

# Entrypoint script is used to replace environment variables
COPY ./docker-entrypoint.sh /app
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
