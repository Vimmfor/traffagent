# TraffAgent (готовый проект)

Готовый лендинг на **Vite + React + Tailwind** с активными кнопками **GitHub** и **Vercel**.

## 1) Как запустить локально
1. Установить Node.js (LTS).
2. В терминале:
   ```bash
   npm i
   npm run dev
   ```
   Открой адрес из консоли (обычно `http://localhost:5173`).

## 2) Настроить ссылки на GitHub и Vercel
Открой файл `src/App.tsx` и замени значения:
```ts
const GITHUB_URL = "https://github.com/vimmfor/traffagent";
const VERCEL_URL = "https://vercel.com/traffagent";
```

## 3) Выгрузить на GitHub
```bash
git init
git remote add origin https://github.com/vimmfor/traffagent.git
git add .
git commit -m "init"
git push -u origin main
```

## 4) Деплой на Vercel
1. Зайти на https://vercel.com и войти.
2. Нажать **New Project** → **Import Git Repository** → выбрать свой репозиторий.
3. Настройки оставьте по умолчанию (Framework: Vite, Build Command: `vite build`, Output: `dist`).
4. Нажмите **Deploy**. После — получите рабочий URL вида `https://имя-проекта.vercel.app`.

> При желании можете настроить сбор лидов: в `src/App.tsx` укажите `LEAD_WEBHOOK` (рекомендуется) **или** Telegram-бота (`TG_BOT_TOKEN` и `TG_CHAT_ID`).

Удачи!
