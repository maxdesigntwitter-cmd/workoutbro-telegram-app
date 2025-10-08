#!/bin/bash

echo "🚀 Установка Content Reactor в Applications..."

# Проверяем права администратора
if [ "$EUID" -ne 0 ]; then
    echo "⚠️ Нужны права администратора для установки в Applications"
    echo "🔐 Запускаю с правами администратора..."
    sudo "$0" "$@"
    exit $?
fi

# Создаем директории
mkdir -p "/Applications/Content Reactor.app/Contents/MacOS"
mkdir -p "/Applications/Content Reactor.app/Contents/Resources"

# Копируем Info.plist
cp "Content Reactor.app/Contents/Info.plist" "/Applications/Content Reactor.app/Contents/Info.plist"

# Копируем исполняемый файл
cp "Content Reactor.app/Contents/MacOS/Content Reactor" "/Applications/Content Reactor.app/Contents/MacOS/Content Reactor"
chmod +x "/Applications/Content Reactor.app/Contents/MacOS/Content Reactor"

# Создаем простую иконку
echo "🎨 Создание иконки..."

# Копируем системную иконку как основу
cp "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns" "/Applications/Content Reactor.app/Contents/Resources/app_icon.icns" 2>/dev/null || {
    echo "⚠️ Не удалось скопировать системную иконку"
}

# Устанавливаем правильные права доступа
chmod -R 755 "/Applications/Content Reactor.app"

echo "✅ Content Reactor установлен в Applications!"
echo ""
echo "🎯 Теперь вы можете:"
echo "   1. Найти 'Content Reactor' в Applications"
echo "   2. Перетащить его в Dock для быстрого доступа"
echo "   3. Запускать двойным кликом"
echo ""
echo "📱 Приложение готово к использованию!"







