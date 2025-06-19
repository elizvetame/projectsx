FROM node:23-alpine

LABEL authors="Elizaveta-Melnikova"

WORKDIR /usr/app

COPY . .

RUN mkdir -p /usr/app/sessions && chown -R node:node /usr/app/sessions
COPY package*.json ./
RUN npm i

EXPOSE 3000

CMD ["node", "./index.js"]