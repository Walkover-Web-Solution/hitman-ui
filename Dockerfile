# syntax=docker/dockerfile:1
FROM node:18.17
WORKDIR /app
RUN npm install pm2 -g
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
ENTRYPOINT ["npm","serve"]