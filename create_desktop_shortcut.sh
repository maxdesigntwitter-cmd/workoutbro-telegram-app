#!/bin/bash

echo "🚀 Создание ярлыка на рабочем столе..."

# Получаем путь к рабочему столу
DESKTOP_PATH="$HOME/Desktop"

# Создаем ярлык
SHORTCUT_PATH="$DESKTOP_PATH/Content Reactor.command"

# Копируем .command файл на рабочий стол
cp "Content Reactor.command" "$SHORTCUT_PATH"

# Делаем исполняемым
chmod +x "$SHORTCUT_PATH"

echo "✅ Ярлык создан: $SHORTCUT_PATH"
echo "📱 Теперь вы можете запускать Content Reactor двойным кликом на рабочем столе!"

# Создаем также ярлык в Applications
APPLICATIONS_PATH="/Applications/Content Reactor.command"
sudo cp "Content Reactor.command" "$APPLICATIONS_PATH" 2>/dev/null || {
    echo "⚠️ Не удалось скопировать в Applications (нужны права администратора)"
    echo "💡 Вы можете перетащить ярлык в Applications вручную"
}

echo "🎉 Готово!"

