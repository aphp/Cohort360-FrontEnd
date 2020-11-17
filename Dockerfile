FROM node:12-alpine
WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
RUN yarn --frozen-lockfile

COPY src src
COPY public public

ENV NODE_ENV production

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"] 