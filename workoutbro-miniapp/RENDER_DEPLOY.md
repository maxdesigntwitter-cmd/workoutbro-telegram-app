# 🚀 Деплой на Render

## 1. Деплой Backend на Render

### Шаг 1: Создание проекта
1. Зайдите на [render.com](https://render.com)
2. Войдите через GitHub
3. Нажмите "New +" → "Web Service"
4. Подключите репозиторий: `maxdesigntwitter-cmd/workoutbro-telegram-app`

### Шаг 2: Настройка Backend
- **Name**: `workoutbro-backend`
- **Root Directory**: `workoutbro-miniapp/backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Шаг 3: Переменные окружения
```
NODE_ENV=production
PORT=3001
```

### Шаг 4: Создание PostgreSQL
1. Нажмите "New +" → "PostgreSQL"
2. **Name**: `workoutbro-database`
3. **Database**: `workoutbro`
4. **User**: `workoutbro_user`
5. Скопируйте `DATABASE_URL`

### Шаг 5: Обновление переменных
Добавьте в backend переменные:
```
DATABASE_URL=postgresql://workoutbro_user:password@host:port/workoutbro
```

## 2. Деплой Frontend на Vercel

### Шаг 1: Создание проекта
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Импортируйте репозиторий

### Шаг 2: Настройка Frontend
- **Root Directory**: `workoutbro-miniapp/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### Шаг 3: Переменные окружения
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_TELEGRAM_BOT_TOKEN=8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik
```

## 3. Настройка Web App

1. Откройте `@BotFather`
2. Отправьте `/newapp`
3. Выберите вашего бота
4. **URL**: `https://your-app.vercel.app`
5. **Название**: `WorkoutBro`
6. **Описание**: `Трекер тренировок для Telegram`

## 4. Проверка работы

1. Откройте бота в Telegram
2. Нажмите "Open App"
3. Проверьте загрузку программ
4. Попробуйте отметить подходы

## 🔧 Если что-то не работает:

1. **Проверьте логи** в Render и Vercel
2. **Убедитесь**, что все переменные окружения настроены
3. **Проверьте**, что база данных доступна
4. **Убедитесь**, что URL правильные

## 💰 Стоимость:

- **Render**: Бесплатно (с ограничениями)
- **Vercel**: Бесплатно
- **PostgreSQL**: Бесплатно (1 GB)

**Итого: $0/месяц!**
