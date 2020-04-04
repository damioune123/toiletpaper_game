FROM node:10-alpine
WORKDIR /usr/src/app

COPY . .
RUN cd gui && npm i && npm run build
RUN cd api && npm i

EXPOSE 8080
