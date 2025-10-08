#!/bin/bash

echo "🚀 Создание рабочего ярлыка Content Reactor..."

# Создаем ярлык с абсолютным путем
cat > "$HOME/Desktop/Content Reactor.command" << 'EOF'
#!/bin/bash

# Content Reactor Launcher
# Универсальный запуск с абсолютным путем

CONTENT_REACTOR_DIR="/Users/imax/Local Sites/workoutbroclub/content_reactor"

# Проверяем, что директория существует
if [ ! -d "$CONTENT_REACTOR_DIR" ]; then
    osascript -e 'display dialog "Ошибка: Не найдена директория Content Reactor. Проверьте путь: '"$CONTENT_REACTOR_DIR"'" buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Переходим в директорию приложения
cd "$CONTENT_REACTOR_DIR"

# Проверяем наличие Python
if ! command -v python3 &> /dev/null; then
    osascript -e 'display dialog "Ошибка: Python 3 не найден. Пожалуйста, установите Python 3." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Показываем уведомление о запуске
osascript -e 'display notification "Запускаю Content Reactor..." with title "Content Reactor"'

echo "🚀 Запуск Content Reactor..."
echo "📁 Директория: $CONTENT_REACTOR_DIR"
echo "📱 Откроется в браузере: http://localhost:8501"
echo "⏹️  Для остановки нажмите Ctrl+C"
echo ""

# Запускаем приложение
python3 run.py

# Если приложение закрылось, показываем уведомление
osascript -e 'display notification "Content Reactor закрыт" with title "Content Reactor"'
EOF

# Делаем исполняемым
chmod +x "$HOME/Desktop/Content Reactor.command"

echo "✅ Ярлык создан: $HOME/Desktop/Content Reactor.command"
echo "📱 Теперь вы можете запускать Content Reactor двойным кликом на рабочем столе!"
echo ""
echo "🎯 Для тестирования:"
echo "   1. Дважды кликните на 'Content Reactor.command' на рабочем столе"
echo "   2. Или запустите: open '$HOME/Desktop/Content Reactor.command'"

