#!/bin/bash

# Piano Hero Cover - Скрипт запуска
# Автоматически активирует виртуальное окружение и запускает обработку

echo "🎹 Piano Hero Cover - Автоматический генератор видео"
echo "=================================================="

# Проверяем наличие виртуального окружения
if [ ! -d ".venv" ]; then
    echo "❌ Виртуальное окружение не найдено!"
    echo "Запустите сначала: python3 -m venv .venv"
    echo "Затем: source .venv/bin/activate && pip install -r requirements_simple.txt"
    exit 1
fi

# Активируем виртуальное окружение
echo "🔧 Активация виртуального окружения..."
source .venv/bin/activate

# Проверяем наличие входного файла
if [ $# -eq 0 ]; then
    echo "📁 Использование: $0 <путь_к_видео>"
    echo "📁 Пример: $0 input/example.mp4"
    echo ""
    echo "📂 Доступные файлы в input/:"
    ls -la input/ 2>/dev/null || echo "   (папка input/ пуста)"
    exit 1
fi

INPUT_FILE="$1"

# Проверяем существование файла
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Файл не найден: $INPUT_FILE"
    exit 1
fi

echo "🎬 Обработка видео: $INPUT_FILE"
echo "⏳ Это может занять несколько минут..."
echo ""

# Запускаем обработку
python -m src.main --input "$INPUT_FILE" --verbose

# Проверяем результат
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ УСПЕШНО! Видео создано в папке output/"
    echo "📂 Результат:"
    ls -la output/*.mp4 2>/dev/null | tail -1
    echo ""
    echo "🎉 Готово к публикации в Reels/Shorts/TikTok!"
else
    echo ""
    echo "❌ Ошибка при создании видео"
    echo "💡 Попробуйте запустить с флагом --keep-workdir для отладки"
fi



