FROM node:10-alpine
WORKDIR /usr/src/app

COPY . .
RUN cd gui && npm i && npm run build:local.prod
RUN cd api && npm i
ENV PORT 80
EXPOSE ${PORT}
CMD node api/app.js
