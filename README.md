# Campfire Web Reborn

[![Wakatime](https://wakatime.com/badge/github/timas130/campfire-web.svg)](https://wakatime.com/badge/github/timas130/campfire-web)

[Демо](https://campfire.moe) | [Баги сюда](https://github.com/timas130/campfire-web/issues)

[Доска Notion](https://mhutils.notion.site/0a6ef789f2b843a3b2436c8619f09cc1)

## Как запустить у себя

### Docker

[![Docker Image CI](https://github.com/timas130/campfire-web/actions/workflows/docker.yml/badge.svg)](https://github.com/timas130/campfire-web/actions/workflows/docker.yml)

На каждый коммит собирается [контейнерная версия](https://github.com/timas130/campfire-web/pkgs/container/campfire-web)
для быстрого локального запуска.

```shell
docker run --rm -p 3001:3000 -e LOGIN_TOKEN="<см. .env.example>" ghcr.io/timas130/campfire-web:latest
```

Все переменные в `.env.example` можно указать через `-e`.

### Самостоятельно

Стандартная процедура для [Next.js](https://nextjs.org).

0. Устанавливаем [Node.js](https://nodejs.org) и [pnpm](https://pnpm.io)
1. Клонируем проект:
   ```shell
   git clone https://github.com/timas130/campfire-web
   ```
2. Копируем `.env.example` в `.env.local` и изменяем там параметры на свои
3. Распакуй содержание папки `/package/min/vs` [этого архива](https://registry.npmjs.org/monaco-editor/-/monaco-editor-0.33.0.tgz)
   в `/public/vs`, чтобы получилось вот так:
   ```
   .
   │ ...
   ├── public
   │   │ ...
   │   └── vs
   │       ├── base
   │       ├── basic-languages
   │       ├── editor
   │       ├── language
   │       ├── loader.js
   │       └── README.md
   │ ...
   ```
4. `$ pnpm i`
5. `$ pnpm dev`

## Краткие штуки о разработке

Если решили что-то изменить в вебе, просто помните, что в некоторых местах
кодбаза веба даже хуже, чем кодбаза приложения. Поэтому не бойтесь и смело
пишите говно!

* В `/lib` есть всякие разные штуки, которые я решил не сортировать
  * В `/lib/server.js` функции для запросов к серверу.
  * В `/lib/api.js` утилиты для бэкенда.
  * В `/lib/client-api.js` утилиты для фронтенда (в основном связанные с бэком).
  * В `/lib/text-cover.js` генератор краткого содержания постов для `<title>`.
  * В `/lib/ui.js` утилита для фронтенда, которые относятся к UI.
* В `/components/` все компоненты. Тут происходит мясо.
  * В `/components/cards/` различные карточки, которые обычно показаны справа от основного контента
  * В `/components/controls/` различные поля для ввода и показа данных. Базовые (независимые от кемпа) компоненты.
  * В `/components/moderation/` диалоги и утилиты для модерирования публикаций.
  * В `/components/profile/` только ProfileCard. Говорит само за себя.
  * В `/components/publication/` компоненты публикаций.
    * В `publication/Publication.js` код, который распределяет JSON публикации на нужный компонент.
      Рекомендуется использовать во всех случаях.
    * В `publication/KarmaVotesModal.js`
    * В `publication/comment/` компоненты комментария, редактора комментариев и списка комментариев.
    * В `publication/mod/` компонент публикации модераторского действия.
    * В `publication/post/` публикация поста и related.
      * В `post/Post.js` сам компонент поста.
      * В `post/PostFilters.js` фильтры для коллекций постов и публикаций.
      * В `post/Tags.js` компонент для показа тегов. Используется в `/post/[id]`.
      * В `post/pages/` компоненты для каждого типа страниц, а также редакторы для некоторых из них.
  * В `/components/CImage.js` компонент для вставки картинки по ID Campfire.
  * В `/components/FeedLayout.js` компонент для разметки страницы в два (2|1) столбца. Используется почти везде.
  * В `/components/Karma.js` показатель кармы.