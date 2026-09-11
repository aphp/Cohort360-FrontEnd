FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN bash ./scripts/createVersionJson.sh

CMD ["npm", "start"]
