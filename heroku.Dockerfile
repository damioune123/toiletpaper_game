FROM node:10-alpine
WORKDIR /usr/src/app

COPY . .
RUN cd gui && npm i && npm run build:heroku
RUN cd api && npm i
CMD node api/app.js
