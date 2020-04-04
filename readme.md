### Toiletpaper game

## Installation for development

**Backend**
1. cd api && npm i

**Frontend**
1. cd gui && npm i

## Launch for development

**Backend**
1. cd api && node app.js

**Frontend**
1. cd gui && npm run start:dev

## Launch the app locally via docker-compose

1. Install docker-compose ( https://docs.docker.com/compose/install/ )
2. Launch a terminal and type : docker-compose up

## Deploy on heroku

1. Install Heroku CLI
2. (sudo) heroku login
3. (sudo) heroku container:push web --app toiletpapergame
4. (sudo) heroku container:release web --app toiletpapergame