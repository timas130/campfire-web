FROM node

LABEL org.opencontainers.image.source=https://github.com/timas130/campfire-web

COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build

EXPOSE 3000
CMD npm run start
