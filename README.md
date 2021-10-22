# Campfire Web Reborn

[Демо](https://camp.33rd.dev) | [Баги сюда](https://github.com/timas130/campfire-web/issues)

## Как запустить у себя

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
