FROM node

LABEL org.opencontainers.image.source=https://github.com/timas130/campfire-web

COPY . /app
WORKDIR /app
ARG SENTRY_TOKEN
RUN npm install
RUN SENTRY_AUTH_TOKEN=$SENTRY_TOKEN npm run build

#HEALTHCHECK --interval=35s --timeout=4s CMD curl -f http://localhost:3000/api/account/1 || exit 1

EXPOSE 3000
CMD npm run start
