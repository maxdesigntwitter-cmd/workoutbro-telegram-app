#!/bin/bash

echo "🎨 Установка иконки для Content Reactor..."

# Создаем простую иконку
python3 -c "
from PIL import Image, ImageDraw
import os

# Создаем простую иконку
img = Image.new('RGB', (512, 512), color='#1E3A8A')
draw = ImageDraw.Draw(img)

# Рисуем дизайн реактора
center = 256
draw.ellipse([center-120, center-120, center+120, center+120], outline='#60A5FA', width=20)
draw.ellipse([center-80, center-80, center+80, center+80], outline='#93C5FD', width=15)
draw.ellipse([center-40, center-40, center+40, center+40], fill='#DBEAFE', outline='#3B82F6', width=10)
draw.ellipse([center-16, center-16, center+16, center+16], fill='#1D4ED8')

# Энергетические линии
line_color = '#F59E0B'
draw.line([136, center, 176, center], fill=line_color, width=8)
draw.line([336, center, 376, center], fill=line_color, width=8)
draw.line([center, 136, center, 176], fill=line_color, width=8)
draw.line([center, 336, center, 376], fill=line_color, width=8)

# Сохраняем
img.save('app_icon.png')
print('✅ Иконка создана')
" 2>/dev/null || {
    echo "⚠️ PIL не установлен, создаю простую иконку..."
    # Создаем минимальную иконку
    sips -s format png -z 512 512 "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns" --out "app_icon.png" 2>/dev/null || {
        echo "❌ Не удалось создать иконку"
        exit 1
    }
}

# Устанавливаем иконку для .command файла
if [ -f "app_icon.png" ]; then
    # Конвертируем в .icns
    mkdir -p icon.iconset
    cp app_icon.png icon.iconset/icon_512x512.png
    cp app_icon.png icon.iconset/icon_256x256.png
    cp app_icon.png icon.iconset/icon_128x128.png
    cp app_icon.png icon.iconset/icon_64x64.png
    cp app_icon.png icon.iconset/icon_32x32.png
    cp app_icon.png icon.iconset/icon_16x16.png
    
    iconutil -c icns icon.iconset -o app_icon.icns
    rm -rf icon.iconset
    
    # Устанавливаем иконку
    fileicon set "Content Reactor.command" app_icon.icns 2>/dev/null || {
        echo "⚠️ fileicon не установлен, иконка не установлена"
        echo "💡 Для установки иконки выполните: brew install fileicon"
    }
    
    echo "✅ Иконка установлена для Content Reactor.command"
else
    echo "❌ Иконка не найдена"
fi

# Очищаем временные файлы
rm -f app_icon.png app_icon.icns

echo "🎉 Готово!"

