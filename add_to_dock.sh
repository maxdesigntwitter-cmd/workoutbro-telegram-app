#!/bin/bash

echo "🚀 Добавление Content Reactor в Dock..."

# Проверяем, что приложение установлено
if [ ! -d "/Applications/Content Reactor.app" ]; then
    echo "❌ Content Reactor не найден в Applications"
    echo "💡 Сначала запустите: ./copy_to_applications.sh"
    exit 1
fi

# Добавляем в Dock через AppleScript
osascript << 'EOF'
tell application "System Events"
    -- Открываем Applications
    tell application "Finder"
        activate
        open folder "Applications" of startup disk
    end tell
    
    -- Ждем немного
    delay 2
    
    -- Показываем уведомление
    display notification "Перетащите Content Reactor в Dock для быстрого доступа" with title "Content Reactor"
end tell
EOF

echo "✅ Applications открыт!"
echo ""
echo "🎯 Теперь:"
echo "   1. Найдите 'Content Reactor' в Applications"
echo "   2. Перетащите его в Dock (слева от разделителя)"
echo "   3. Готово! Теперь можно запускать одним кликом"
echo ""
echo "💡 Совет: Перетащите иконку в удобное место в Dock"


















