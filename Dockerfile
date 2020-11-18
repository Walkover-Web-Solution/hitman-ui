# Docker Image which is used as foundation to create
# a custom Docker Image with this Dockerfile
FROM node:12.14.0

# A directory within the virtualized Docker environment
# Becomes more relevant when using Docker Compose later
RUN mkdir -p /hitman-ui
WORKDIR /hitman-ui

# Copies package.json and package-lock.json to Docker environment
#COPY package*.json ./

# Installs all node packages
#RUN npm install

# Copies everything over to Docker environment
COPY . /hitman-ui/

# Uses port which is used by the actual application
EXPOSE 3030
RUN npm install

RUN npm install -g serve

RUN yarn build

CMD serve -s build -p 3030
# Finally runs the application
#CMD [ "serve", "-s", "build" "-p" "6060" ]
