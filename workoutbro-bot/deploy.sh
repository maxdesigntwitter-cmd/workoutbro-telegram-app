#!/bin/bash

# 🚀 Скрипт развертывания WorkoutBro Bot

echo "🚀 Развертывание WorkoutBro Bot..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+"
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
npm install

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Создаем из примера..."
    cp env.example .env
    echo "📝 Отредактируйте файл .env и добавьте ваш BOT_TOKEN"
    echo "   BOT_TOKEN=8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik"
fi

# Проверяем токен
if grep -q "your_bot_token_here" .env; then
    echo "⚠️  Не забудьте заменить your_bot_token_here на реальный токен в .env"
fi

echo "🎯 Выберите способ развертывания:"
echo "1) Render.com (рекомендуется)"
echo "2) Railway"
echo "3) Heroku"
echo "4) Локальный запуск с PM2"
echo "5) Обычный локальный запуск"

read -p "Введите номер (1-5): " choice

case $choice in
    1)
        echo "🌐 Развертывание на Render.com..."
        echo "1. Перейдите на https://render.com"
        echo "2. Создайте новый Web Service"
        echo "3. Подключите этот репозиторий"
        echo "4. Настройте переменные окружения:"
        echo "   BOT_TOKEN: 8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik"
        echo "   NODE_ENV: production"
        echo "5. Build Command: npm install"
        echo "6. Start Command: node simple-pro-bot.js"
        ;;
    2)
        echo "🚂 Развертывание на Railway..."
        echo "1. Перейдите на https://railway.app"
        echo "2. Создайте новый проект"
        echo "3. Подключите этот репозиторий"
        echo "4. Добавьте переменную BOT_TOKEN: 8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik"
        ;;
    3)
        echo "🟣 Развертывание на Heroku..."
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI не найден. Установите: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        echo "Создание Heroku приложения..."
        heroku create workoutbro-bot
        
        echo "Добавление переменных окружения..."
        heroku config:set BOT_TOKEN=8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik
        heroku config:set NODE_ENV=production
        
        echo "Деплой..."
        git push heroku main
        ;;
    4)
        echo "🔄 Установка PM2..."
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        
        echo "Запуск бота с PM2..."
        pm2 start simple-pro-bot.js --name "workoutbro-bot"
        pm2 save
        pm2 startup
        
        echo "✅ Бот запущен с PM2!"
        echo "Команды управления:"
        echo "  pm2 status          - статус"
        echo "  pm2 logs            - логи"
        echo "  pm2 restart         - перезапуск"
        echo "  pm2 stop            - остановка"
        ;;
    5)
        echo "🏃 Локальный запуск..."
        echo "Запуск бота..."
        node simple-pro-bot.js
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo "🎉 Готово! Бот должен работать 24/7"
