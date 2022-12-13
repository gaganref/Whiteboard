#FROM node:18-alpine
#
## Create app directory
#RUN mkdir -p /usr/src/app
#WORKDIR /usr/src/app
#
## Install app dependencies
#COPY package.json /usr/src/app/
#RUN npm install --prod
#
## Bundle app source
#COPY . /usr/src/app
#
#EXPOSE 3000
#CMD [ "npm", "start" ]

FROM node:18-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]
RUN ls
RUN npm install --production
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]