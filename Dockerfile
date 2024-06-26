# syntax=docker/dockerfile:1
FROM node:18.17
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /app
EXPOSE 3000
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install -g pm2
RUN npm install -g serve
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build:prod
ENTRYPOINT ["serve","-s","build","-l","3000"]