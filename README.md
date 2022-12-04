# tt-front-server

Проект развернут на https://tt-front.vercel.app/

# Запуск

```bash
npm i
npm start
```

# Список доступных API

Полный список API можно увидеть в [исходном коде](/server.js).

Запросы необходимо делать относительно сервера https://tt-front.vercel.app/

* `GET` `/messages` – Получить список всех сообщений
* `GET` `/messages/:id` – Получить сообщение по `id`
* `GET` `/messages-sse` – Точка входа для SSE
* `GET` `/messages-sse-view` – Страница с примером реализации SSE (работает только локально)
* `POST` `/message` – Отправить сообщение. Параметры: `{author: string, text: string}`

Пример:
```
{
  author: "Martin Komitsky",
  text: "Hello, chat",
}
```
* `GET` `/files` – Страница с примером реализации отправки формы с файлами
* `POST` `/upload` – Отправить файл в `FormData`. Параметры: `image: File, audio: File`

# Деплой

```bash
npm run deploy
```
