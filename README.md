# tt-front-server

Проект развернут на https://tt-front.vercel.app/

# Запуск

```bash
npm i
npm start
```

# Список доступных API:

Полный список API можно увидеть в [исходном коде](/server.js).

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

# Деплой

```bash
npm run deploy
```
