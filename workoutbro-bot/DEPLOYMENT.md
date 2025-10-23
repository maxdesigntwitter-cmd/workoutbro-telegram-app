# 🚀 Развертывание WorkoutBro Bot 24/7

## 📋 Варианты развертывания

### 1. Render.com (Рекомендуется)

#### Шаги:
1. **Создайте аккаунт** на [render.com](https://render.com)
2. **Подключите GitHub** репозиторий
3. **Создайте новый Web Service**
4. **Настройте переменные окружения:**
   - `BOT_TOKEN`: `8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik`
   - `NODE_ENV`: `production`

#### Настройки Render:
- **Build Command**: `npm install`
- **Start Command**: `node simple-pro-bot.js`
- **Plan**: Free (достаточно для бота)

### 2. Railway

#### Шаги:
1. **Создайте аккаунт** на [railway.app](https://railway.app)
2. **Подключите GitHub** репозиторий
3. **Добавьте переменные окружения:**
   - `BOT_TOKEN`: `8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik`

### 3. Heroku

#### Шаги:
1. **Установите Heroku CLI**
2. **Создайте приложение**: `heroku create workoutbro-bot`
3. **Добавьте переменные**: `heroku config:set BOT_TOKEN=8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik`
4. **Деплой**: `git push heroku main`

### 4. VPS (Полный контроль)

#### Требования:
- Ubuntu 20.04+
- Node.js 18+
- PM2 для управления процессами

#### Установка:
```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Клонирование репозитория
git clone https://github.com/your-username/workoutbro-bot.git
cd workoutbro-bot

# Установка зависимостей
npm install

# Создание .env файла
echo "BOT_TOKEN=8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik" > .env

# Запуск с PM2
pm2 start simple-pro-bot.js --name "workoutbro-bot"
pm2 save
pm2 startup
```

## 🔧 Настройка переменных окружения

### Обязательные переменные:
- `BOT_TOKEN` - токен Telegram бота
- `NODE_ENV` - среда выполнения (production)

### Опциональные переменные:
- `ADMIN_TELEGRAM_ID` - ID администратора
- `LOG_LEVEL` - уровень логирования

## 📊 Мониторинг

### Render.com:
- Автоматический мониторинг
- Логи в реальном времени
- Уведомления об ошибках

### Railway:
- Встроенный мониторинг
- Логи через CLI: `railway logs`

### PM2 (VPS):
```bash
# Статус процессов
pm2 status

# Логи
pm2 logs workoutbro-bot

# Перезапуск
pm2 restart workoutbro-bot

# Мониторинг
pm2 monit
```

## 🚨 Устранение неполадок

### Бот не отвечает:
1. Проверьте логи
2. Убедитесь, что токен правильный
3. Проверьте, что бот не заблокирован

### Ошибки развертывания:
1. Проверьте переменные окружения
2. Убедитесь, что все зависимости установлены
3. Проверьте синтаксис кода

## 📈 Масштабирование

### Для высоких нагрузок:
1. **Используйте webhook** вместо polling
2. **Добавьте Redis** для кеширования
3. **Настройте load balancing**

### Webhook настройка:
```javascript
// Вместо bot.launch()
bot.launch({
  webhook: {
    domain: 'https://your-domain.com',
    port: process.env.PORT || 3000
  }
});
```

## 🔒 Безопасность

### Рекомендации:
1. **Не храните токены** в коде
2. **Используйте переменные окружения**
3. **Настройте HTTPS** для webhook
4. **Ограничьте доступ** к админским функциям

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи
2. Убедитесь в правильности настроек
3. Обратитесь к документации платформы
