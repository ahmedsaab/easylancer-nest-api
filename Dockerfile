FROM node:10-alpine

WORKDIR /usr/src/app/temp

COPY . .

RUN npm install

RUN npm run build

RUN mv dist/* ..

RUN mv config ..

WORKDIR /usr/src/app

RUN npm install --production

RUN rm -rf temp

EXPOSE 3003

CMD [ "npm", "run", "start:prod" ]
