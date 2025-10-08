#!/bin/bash

echo "🚀 Настройка Content Reactor App..."

# Создаем простую иконку из системных ресурсов
echo "📱 Создание иконки..."

# Копируем системную иконку как основу
cp "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns" "Content Reactor.app/Contents/Resources/app_icon.icns" 2>/dev/null || {
    # Если не получилось, создаем простую иконку
    echo "Создаю простую иконку..."
    
    # Создаем базовую иконку 512x512
    sips -s format png -s dpiHeight 72 -s dpiWidth 72 -z 512 512 "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns" --out "Content Reactor.app/Contents/Resources/app_icon.png" 2>/dev/null || {
        # Если и это не работает, создаем минимальную иконку
        echo "Создаю минимальную иконку..."
        # Создаем простой синий квадрат
        python3 -c "
from PIL import Image, ImageDraw
import os

# Создаем директорию если не существует
os.makedirs('Content Reactor.app/Contents/Resources', exist_ok=True)

# Создаем простую иконку
img = Image.new('RGB', (512, 512), color='#1E3A8A')
draw = ImageDraw.Draw(img)

# Рисуем простой дизайн
draw.ellipse([100, 100, 412, 412], outline='#60A5FA', width=20)
draw.ellipse([150, 150, 362, 362], outline='#93C5FD', width=15)
draw.ellipse([200, 200, 312, 312], fill='#DBEAFE', outline='#3B82F6', width=10)
draw.ellipse([240, 240, 272, 272], fill='#1D4ED8')

# Сохраняем
img.save('Content Reactor.app/Contents/Resources/app_icon.png')
print('✅ Иконка создана')
" 2>/dev/null || echo "⚠️ Не удалось создать иконку с PIL"
    }
}

# Создаем .icns файл
echo "🔄 Создание .icns файла..."
mkdir -p "Content Reactor.app/Contents/Resources/icon.iconset"

# Копируем иконку в разные размеры
if [ -f "Content Reactor.app/Contents/Resources/app_icon.png" ]; then
    cp "Content Reactor.app/Contents/Resources/app_icon.png" "Content Reactor.app/Contents/Resources/icon.iconset/icon_512x512.png"
    cp "Content Reactor.app/Contents/Resources/app_icon.png" "Content Reactor.app/Contents/Resources/icon.iconset/icon_256x256.png"
    cp "Content Reactor.app/Contents/Resources/app_icon.png" "Content Reactor.app/Contents/Resources/icon.iconset/icon_128x128.png"
    cp "Content Reactor.app/Contents/Resources/app_icon.png" "Content Reactor.app/Contents/Resources/icon.iconset/icon_64x64.png"
    cp "Content Reactor.app/Contents/Resources/app_icon.png" "Content Reactor.app/Contents/Resources/icon.iconset/icon_32x32.png"
    cp "Content Reactor.app/Contents/Resources/app_icon.png" "Content Reactor.app/Contents/Resources/icon.iconset/icon_16x16.png"
    
    # Создаем .icns файл
    iconutil -c icns "Content Reactor.app/Contents/Resources/icon.iconset" -o "Content Reactor.app/Contents/Resources/app_icon.icns"
    
    # Удаляем временную папку
    rm -rf "Content Reactor.app/Contents/Resources/icon.iconset"
    
    echo "✅ .icns файл создан"
else
    echo "⚠️ PNG иконка не найдена, используем системную"
fi

# Устанавливаем правильные права доступа
chmod -R 755 "Content Reactor.app"
chmod +x "Content Reactor.app/Contents/MacOS/Content Reactor"

echo "✅ Content Reactor App настроен!"
echo "📱 Приложение готово к использованию: Content Reactor.app"
echo ""
echo "🚀 Для запуска:"
echo "   1. Дважды кликните на 'Content Reactor.app'"
echo "   2. Или перетащите в Applications и запустите оттуда"
echo ""
echo "⚠️ При первом запуске macOS может спросить разрешение на запуск"

