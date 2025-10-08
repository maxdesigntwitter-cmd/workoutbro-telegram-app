#!/bin/bash

echo "🚀 Копирование Content Reactor в Applications..."

# Проверяем, можем ли мы писать в Applications
if [ ! -w "/Applications" ]; then
    echo "⚠️ Нет прав для записи в Applications"
    echo "💡 Попробуйте запустить: sudo ./install_to_applications.sh"
    echo "💡 Или скопируйте вручную:"
    echo "   cp -r 'Content Reactor.app' '/Applications/'"
    exit 1
fi

# Копируем приложение
echo "📁 Копирую приложение..."
cp -r "Content Reactor.app" "/Applications/"

# Устанавливаем права доступа
chmod -R 755 "/Applications/Content Reactor.app"

echo "✅ Content Reactor скопирован в Applications!"
echo ""
echo "🎯 Теперь вы можете:"
echo "   1. Найти 'Content Reactor' в Applications"
echo "   2. Перетащить его в Dock для быстрого доступа"
echo "   3. Запускать двойным кликом"
echo ""
echo "📱 Приложение готово к использованию!"







