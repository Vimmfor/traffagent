# TraffAgent (готовый проект)

- Vite + React + Tailwind
- Подключён Meta Pixel ID **1984692076263555** (в head), noscript в body
- Все целевые кнопки шлют событие **Lead**
- Квиз: финальный шаг с вопросом и двумя кнопками — обе ведут в Telegram и шлют **Lead**

## Старт локально
```bash
npm i
npm run dev
```
Открой адрес из консоли (обычно http://localhost:5173).

## Деплой на Vercel
- Подключи репозиторий и нажми Deploy (Framework: Vite, Build: `vite build`, Output: `dist`).

## GitHub/Vercel ссылки в UI
Поменяй (если надо) в `src/App.tsx`:
```ts
const GITHUB_URL = "https://github.com/vimmfor/traffagent";
const VERCEL_URL = "https://vercel.com/dashboard?project=traffagent";
```
