#!/usr/bin/env python3
"""
Создание иконки для Content Reactor
"""
import os
import sys

def create_simple_icon():
    """Создает простую иконку используя встроенные возможности"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        has_pil = True
    except ImportError:
        has_pil = False
    
    if has_pil:
        # Создаем иконку с PIL
        size = 512
        img = Image.new('RGBA', (size, size), (30, 58, 138, 255))  # Синий фон
        draw = ImageDraw.Draw(img)
        
        # Рисуем круги (реактор)
        center = size // 2
        draw.ellipse([center-120, center-120, center+120, center+120], 
                    outline=(96, 165, 250, 255), width=8)  # Внешний круг
        draw.ellipse([center-80, center-80, center+80, center+80], 
                    outline=(147, 197, 253, 255), width=6)  # Средний круг
        draw.ellipse([center-40, center-40, center+40, center+40], 
                    fill=(219, 234, 254, 255), outline=(59, 130, 246, 255), width=4)  # Внутренний круг
        
        # Центральная точка
        draw.ellipse([center-16, center-16, center+16, center+16], 
                    fill=(29, 78, 216, 255))
        
        # Энергетические линии
        line_color = (245, 158, 11, 255)
        draw.line([136, center, 176, center], fill=line_color, width=6)  # Горизонтальная
        draw.line([336, center, 376, center], fill=line_color, width=6)
        draw.line([center, 136, center, 176], fill=line_color, width=6)  # Вертикальная
        draw.line([center, 336, center, 376], fill=line_color, width=6)
        
        # Диагональные линии
        draw.line([176, 176, 200, 200], fill=line_color, width=4)
        draw.line([336, 176, 312, 200], fill=line_color, width=4)
        draw.line([176, 336, 200, 312], fill=line_color, width=4)
        draw.line([336, 336, 312, 312], fill=line_color, width=4)
        
        # Сохраняем иконку
        icon_path = "Content Reactor.app/Contents/Resources/app_icon.png"
        img.save(icon_path)
        print(f"✅ Иконка создана: {icon_path}")
        
        # Создаем иконку 256x256 для icns
        img_256 = img.resize((256, 256), Image.Resampling.LANCZOS)
        icon_256_path = "Content Reactor.app/Contents/Resources/app_icon_256.png"
        img_256.save(icon_256_path)
        print(f"✅ Иконка 256x256 создана: {icon_256_path}")
        
        return True
        
    else:
        print("❌ PIL не установлен. Создаю простую иконку...")
        return create_fallback_icon()

def create_fallback_icon():
    """Создает простую иконку без PIL"""
    # Создаем простой PNG файл программно
    # Это базовый PNG с минимальным содержимым
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x02\x00\x00\x00\x02\x00\x08\x06\x00\x00\x00\xf4\x78\xd4\xfa\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\xc9e<\x00\x00\x00\x0eIDATx\xdab\x00\x02\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    
    icon_path = "Content Reactor.app/Contents/Resources/app_icon.png"
    with open(icon_path, 'wb') as f:
        f.write(png_data)
    
    print(f"✅ Простая иконка создана: {icon_path}")
    return True

if __name__ == "__main__":
    create_simple_icon()

