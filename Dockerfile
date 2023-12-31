# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
# FROM node:12.14.0
FROM tiangolo/node-frontend:10 as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/build/ /usr/share/nginx/html
# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY --from=build-stage /app/default.conf /etc/nginx/conf.d/hitman.template
ARG PRERENDER_TOKEN
RUN VARS='$PRERENDER_TOKEN' && envsubst "$VARS" < /etc/nginx/conf.d/hitman.template > /etc/nginx/conf.d/default.conf