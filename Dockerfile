FROM node:17-alpine

LABEL org.opencontainers.image.source=https://github.com/timas130/campfire-web

COPY . /app
WORKDIR /app
ARG SENTRY_TOKEN
RUN wget -O /app/monaco.tgz https://registry.npmjs.org/monaco-editor/-/monaco-editor-0.33.0.tgz && \
    tar xf /app/monaco.tgz -C /app/public/vs && \
    mv /app/public/vs/package/min/vs/* /app/public/vs && \
    rm -rf /app/monaco.tar.gz /app/public/vs/package/
RUN npx pnpm install
RUN SENTRY_AUTH_TOKEN=$SENTRY_TOKEN npm run build

#HEALTHCHECK --interval=35s --timeout=4s CMD curl -f http://localhost:3000/api/account/1 || exit 1

EXPOSE 3000
CMD npm run start
