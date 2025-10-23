#!/usr/bin/env python3
"""
Создание иконки для Content Reactor
"""
import os

def create_app_icon():
    """Создает иконку приложения"""
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
                    outline=(96, 165, 250, 255), width=20)  # Внешний круг
        draw.ellipse([center-80, center-80, center+80, center+80], 
                    outline=(147, 197, 253, 255), width=15)  # Средний круг
        draw.ellipse([center-40, center-40, center+40, center+40], 
                    fill=(219, 234, 254, 255), outline=(59, 130, 246, 255), width=10)  # Внутренний круг
        
        # Центральная точка
        draw.ellipse([center-16, center-16, center+16, center+16], 
                    fill=(29, 78, 216, 255))
        
        # Энергетические линии
        line_color = (245, 158, 11, 255)
        draw.line([136, center, 176, center], fill=line_color, width=8)  # Горизонтальная
        draw.line([336, center, 376, center], fill=line_color, width=8)
        draw.line([center, 136, center, 176], fill=line_color, width=8)  # Вертикальная
        draw.line([center, 336, center, 376], fill=line_color, width=8)
        
        # Диагональные линии
        draw.line([176, 176, 200, 200], fill=line_color, width=4)
        draw.line([336, 176, 312, 200], fill=line_color, width=4)
        draw.line([176, 336, 200, 312], fill=line_color, width=4)
        draw.line([336, 336, 312, 312], fill=line_color, width=4)
        
        # Сохраняем иконку
        icon_path = "/Applications/Content Reactor.app/Contents/Resources/app_icon.png"
        img.save(icon_path)
        print(f"✅ Иконка создана: {icon_path}")
        
        # Создаем .icns файл
        create_icns_file(icon_path)
        
        return True
        
    else:
        print("❌ PIL не установлен. Создаю простую иконку...")
        return create_fallback_icon()

def create_icns_file(png_path):
    """Создает .icns файл из PNG"""
    try:
        # Создаем iconset
        iconset_dir = "/Applications/Content Reactor.app/Contents/Resources/icon.iconset"
        os.makedirs(iconset_dir, exist_ok=True)
        
        # Копируем иконку в разные размеры
        sizes = [16, 32, 64, 128, 256, 512]
        for size in sizes:
            # Создаем копию для каждого размера
            import shutil
            shutil.copy2(png_path, f"{iconset_dir}/icon_{size}x{size}.png")
        
        # Создаем .icns файл
        import subprocess
        result = subprocess.run([
            "iconutil", "-c", "icns", iconset_dir, 
            "-o", "/Applications/Content Reactor.app/Contents/Resources/app_icon.icns"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ .icns файл создан")
            # Удаляем временную папку
            import shutil
            shutil.rmtree(iconset_dir)
        else:
            print(f"⚠️ Ошибка создания .icns: {result.stderr}")
            
    except Exception as e:
        print(f"⚠️ Ошибка создания .icns: {e}")

def create_fallback_icon():
    """Создает простую иконку без PIL"""
    # Копируем системную иконку
    import shutil
    try:
        shutil.copy2(
            "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns",
            "/Applications/Content Reactor.app/Contents/Resources/app_icon.icns"
        )
        print("✅ Системная иконка скопирована")
        return True
    except Exception as e:
        print(f"❌ Не удалось скопировать системную иконку: {e}")
        return False

if __name__ == "__main__":
    create_app_icon()


















