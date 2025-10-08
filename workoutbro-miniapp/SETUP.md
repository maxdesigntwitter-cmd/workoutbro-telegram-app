# 🚀 Инструкция по запуску WorkoutBro

## ✅ Что уже сделано

1. **Node.js установлен** - версия 22.20.0
2. **Зависимости установлены** для frontend и backend
3. **Проект успешно собирается** без ошибок
4. **Структура проекта создана** согласно техническому заданию

## 🔧 Следующие шаги для запуска

### 1. Настройка базы данных

```bash
# Установите PostgreSQL (если не установлен)
# На macOS с Homebrew:
brew install postgresql
brew services start postgresql

# Создайте базу данных
createdb workoutbro
```

### 2. Настройка переменных окружения

#### Backend (.env файл)
```bash
cd backend
cp config.env .env
```

Отредактируйте `.env` файл:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/workoutbro"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Security
JWT_SECRET=your_jwt_secret_here_workoutbro_2025
```

#### Frontend (.env файл)
```bash
cd frontend
cp config.env .env
```

### 3. Инициализация базы данных

```bash
cd backend

# Загрузите nvm
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Запустите миграции Prisma
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Создание Telegram бота

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Создайте нового бота командой `/newbot`
3. Следуйте инструкциям и получите токен
4. Добавьте токен в `.env` файл backend
5. Настройте Web App URL в настройках бота

### 5. Запуск приложения

#### Запуск Backend (в отдельном терминале)
```bash
cd backend
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

#### Запуск Frontend (в отдельном терминале)
```bash
cd frontend
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm start
```

### 6. Проверка работы

- **Backend API**: http://localhost:3001/health
- **Frontend**: http://localhost:3000
- **Telegram Bot**: Найдите вашего бота в Telegram и запустите Web App

## 📁 Структура проекта

```
workoutbro-miniapp/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/       # UI компоненты
│   │   ├── pages/           # Страницы приложения
│   │   ├── hooks/           # React хуки
│   │   ├── services/        # API сервисы
│   │   ├── types/           # TypeScript типы
│   │   └── styles/          # Стили
│   ├── build/               # Собранное приложение
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/     # Контроллеры
│   │   ├── routes/          # API роуты
│   │   ├── middleware/      # Middleware
│   │   ├── config/          # Конфигурация
│   │   └── main.ts          # Точка входа
│   ├── prisma/              # База данных
│   ├── dist/                # Собранный код
│   └── package.json
└── README.md
```

## 🎯 Основные функции

- ✅ **Главный экран** с приветствием и быстрыми действиями
- ✅ **Тренировочные программы** с готовыми упражнениями
- ✅ **Активные тренировки** с таймерами и отслеживанием
- ✅ **История тренировок** с статистикой
- ✅ **Измерения тела** и прогресс
- ✅ **Экспорт данных** в CSV/PDF
- ✅ **Telegram интеграция** с аутентификацией
- ✅ **Современный UI** с тёмной темой и анимациями

## 🔧 Полезные команды

```bash
# Загрузка nvm (добавьте в ~/.zshrc для автоматической загрузки)
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Сборка проектов
cd frontend && npm run build
cd backend && npm run build

# Запуск в режиме разработки
cd frontend && npm start
cd backend && npm run dev

# Работа с базой данных
cd backend && npx prisma studio  # Веб-интерфейс для БД
cd backend && npx prisma migrate dev  # Создание миграций
```

## 🚀 Готово к разработке!

Проект полностью настроен и готов к работе. Все зависимости установлены, код собирается без ошибок, структура соответствует техническому заданию.

**Следующий шаг**: Настройте базу данных и Telegram бота, затем запустите приложение!
