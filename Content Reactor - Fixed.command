#!/bin/bash

# Content Reactor - Fixed Architecture Launcher
# Исправляет проблемы архитектуры автоматически

# Основной путь к приложению
CONTENT_REACTOR_DIR="/Users/imax/Local Sites/workoutbroclub/content_reactor"

echo "🚀 Content Reactor - Fixed Architecture Launcher"
echo "==============================================="

# Проверяем, что директория существует
if [ ! -d "$CONTENT_REACTOR_DIR" ]; then
    osascript -e 'display dialog "Ошибка: Не найдена директория Content Reactor." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Переходим в директорию приложения
cd "$CONTENT_REACTOR_DIR"

# Используем системный Python с принудительной ARM64 архитектурой
PYTHON_CMD="arch -arm64 /usr/bin/python3"

echo "🐍 Использую системный Python (ARM64): $($PYTHON_CMD --version)"

# Проверяем, что Python работает
if ! $PYTHON_CMD --version &> /dev/null; then
    osascript -e 'display dialog "Ошибка: Python 3 не найден." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Функция для переустановки проблемных пакетов
fix_architecture() {
    echo "🔧 Исправляю архитектуру пакетов..."
    
    # Список проблемных пакетов
    PROBLEMATIC_PACKAGES=(
        "pydantic"
        "pydantic-core" 
        "rpds-py"
        "jsonschema"
        "jsonschema-specifications"
        "attrs"
        "referencing"
    )
    
    for package in "${PROBLEMATIC_PACKAGES[@]}"; do
        echo "🔄 Переустанавливаю $package..."
        $PYTHON_CMD -m pip uninstall "$package" -y --quiet
        $PYTHON_CMD -m pip install "$package" --user --force-reinstall --quiet
    done
    
    echo "✅ Архитектура исправлена!"
}

# Проверяем зависимости
if ! $PYTHON_CMD -c "import streamlit" &> /dev/null; then
    osascript -e 'display notification "Устанавливаю зависимости..." with title "Content Reactor"'
    echo "Устанавливаю зависимости..."
    $PYTHON_CMD -m pip install -r requirements.txt --quiet --user
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "Ошибка установки зависимостей." buttons {"OK"} default button "OK" with icon stop'
        exit 1
    fi
    osascript -e 'display notification "Зависимости установлены!" with title "Content Reactor"'
fi

# Проверяем Google Generative AI
if ! $PYTHON_CMD -c "import google.generativeai" &> /dev/null; then
    osascript -e 'display notification "Устанавливаю Google AI..." with title "Content Reactor"'
    echo "Устанавливаю Google Generative AI..."
    $PYTHON_CMD -m pip install google-generativeai --quiet --user
    if [ $? -ne 0 ]; then
        osascript -e 'display notification "Предупреждение: Google AI не установлен" with title "Content Reactor"'
    fi
fi

# Проверяем архитектуру и исправляем при необходимости
if ! $PYTHON_CMD -c "import pydantic" &> /dev/null; then
    osascript -e 'display notification "Исправляю архитектуру..." with title "Content Reactor"'
    fix_architecture
fi

# Показываем уведомление о запуске
osascript -e 'display notification "Запускаю Content Reactor..." with title "Content Reactor"'

# Запускаем приложение
$PYTHON_CMD run.py

# Если приложение закрылось, показываем уведомление
osascript -e 'display notification "Content Reactor закрыт" with title "Content Reactor"'







