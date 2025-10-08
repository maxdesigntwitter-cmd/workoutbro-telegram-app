# 🚀 Инструкции по деплою WorkoutBro в Telegram

## 1. Создание Telegram бота

1. Откройте Telegram и найдите `@BotFather`
2. Отправьте команду `/newbot`
3. Введите название бота: `WorkoutBro`
4. Введите username: `workoutbro_bot` (или любой доступный)
5. Сохраните полученный токен бота

## 2. Деплой Frontend на Vercel

### Шаг 1: Подготовка
```bash
cd frontend
npm run build
```

### Шаг 2: Деплой на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Импортируйте репозиторий
4. Настройте переменные окружения:
   - `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`
   - `REACT_APP_TELEGRAM_BOT_TOKEN` = `your_bot_token`

### Шаг 3: Получение URL
После деплоя получите URL вида: `https://your-app.vercel.app`

## 3. Деплой Backend на Railway

### Шаг 1: Подготовка
```bash
cd backend
# Убедитесь, что все зависимости установлены
npm install
```

### Шаг 2: Деплой на Railway
1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Создайте новый проект
4. Подключите репозиторий
5. Настройте переменные окружения:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `DATABASE_URL` = `postgresql://...` (Railway создаст автоматически)

### Шаг 3: Получение URL
После деплоя получите URL вида: `https://your-backend.railway.app`

## 4. Настройка базы данных

### Шаг 1: Создание PostgreSQL
1. В Railway добавьте PostgreSQL сервис
2. Получите `DATABASE_URL`
3. Обновите `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Шаг 2: Миграции
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

## 5. Настройка Web App в Telegram

### Шаг 1: Настройка бота
1. Откройте `@BotFather`
2. Отправьте `/setmenubutton`
3. Выберите вашего бота
4. Отправьте URL вашего приложения: `https://your-app.vercel.app`

### Шаг 2: Настройка Web App
1. Отправьте `/newapp`
2. Выберите вашего бота
3. Введите название: `WorkoutBro`
4. Введите описание: `Трекер тренировок для Telegram`
5. Введите URL: `https://your-app.vercel.app`
6. Загрузите иконку (512x512px)

## 6. Проверка работы

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню
3. Выберите "Open App"
4. Проверьте, что приложение загружается

## 7. Обновления

Для обновления приложения:
1. Внесите изменения в код
2. Запушьте в GitHub
3. Vercel и Railway автоматически пересоберут приложения

## 🔧 Переменные окружения

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token
```

### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
```

## 📱 Тестирование

1. Откройте бота в Telegram
2. Нажмите "Open App"
3. Проверьте все функции:
   - Загрузка программ
   - Выбор упражнений
   - Отметка подходов
   - Сохранение данных
   - Завершение тренировки

## 🚨 Возможные проблемы

1. **CORS ошибки**: Убедитесь, что backend разрешает запросы с вашего домена
2. **API не отвечает**: Проверьте URL в переменных окружения
3. **База данных**: Убедитесь, что миграции выполнены
4. **Telegram WebApp**: Проверьте, что URL настроен правильно

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Vercel и Railway
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что база данных доступна
