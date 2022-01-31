# Campfire Web Reborn

[Демо](https://camp.33rd.dev) | [Баги сюда](https://github.com/timas130/campfire-web/issues)

[![Wakatime](https://wakatime.com/badge/github/timas130/campfire-web.svg)](https://wakatime.com/badge/github/timas130/campfire-web)
[![Node.js CI](https://github.com/timas130/campfire-web/actions/workflows/node.js.yml/badge.svg)](https://github.com/timas130/campfire-web/actions/workflows/node.js.yml)

## Как запустить у себя

### Docker

Я периодически собираю [контейнерную версию](https://github.com/timas130/campfire-web/pkgs/container/campfire-web)
для быстрого локального запуска.

```shell
docker run --rm -p 3001:3000 -e LOGIN_TOKEN="<см. .env.example>" ghcr.io/timas130/campfire-web:latest
```

Все переменные в `.env.example` можно указать через `-e`.

### Самостоятельно

Стандартная процедура для [Next.js](https://nextjs.org).

0. Устанавливаем [Node.js](https://nodejs.org) и npm
1. Клонируем проект:
   ```shell
   $ git clone https://github.com/timas130/campfire-web
   ```
2. Копируем `.env.example` в `.env.local` и изменяем там параметры на свои
3. `$ npm install`
4. `$ npm run dev`

## Краткие штуки о разработке

* В `lib/server.js` функции для запросов к серверу.
* В `lib/api.js` утилиты для бэкенда.
* В `lib/client-api.js` утилиты для фронтенда (в основном связанные с бэком).
* В `lib/text-cover.js` генератор краткого содержания постов для `<title>`.
