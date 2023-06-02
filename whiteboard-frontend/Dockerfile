FROM node:18-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --prod

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]

#
## stage1 as builder
#FROM node:18-alpine as builder
#
## copy the package.json to install dependencies
#COPY package.json package-lock.json ./
#
## Install the dependencies and make the folder
#RUN npm install && mkdir /react-ui && mv ./node_modules ./react-ui
#
#WORKDIR /react-ui
#
#COPY . .
#
## Build the project and copy the files
#RUN npm run build
#
#
#FROM nginx:alpine
#
##!/bin/sh
#
#COPY ../nginx.conf /etc/nginx/nginx.conf
#
### Remove default nginx index page
#RUN rm -rf /usr/share/nginx/html/*
#
## Copy from the stahg 1
#COPY --from=builder /react-ui/build /usr/share/nginx/html
#
#EXPOSE 3000 80
#
#ENTRYPOINT ["nginx", "-g", "daemon off;"]