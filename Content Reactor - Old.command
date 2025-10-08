#!/bin/bash

# Content Reactor - Auto Python Launcher
# Автоматически определяет правильный Python

# Основной путь к приложению
CONTENT_REACTOR_DIR="/Users/imax/Local Sites/workoutbroclub/content_reactor"

echo "🚀 Content Reactor - Auto Python Launcher"
echo "========================================="

# Проверяем, что директория существует
if [ ! -d "$CONTENT_REACTOR_DIR" ]; then
    osascript -e 'display dialog "Ошибка: Не найдена директория Content Reactor." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Переходим в директорию приложения
cd "$CONTENT_REACTOR_DIR"

# Автоматически определяем правильный Python
PYTHON_CMD=""

# Пробуем системный Python (ARM64)
if [ -f "/usr/bin/python3" ]; then
    PYTHON_CMD="arch -arm64 /usr/bin/python3"
    echo "🐍 Использую системный Python (ARM64): $(arch -arm64 /usr/bin/python3 --version)"
fi

# Если системный не работает, пробуем Homebrew
if [ -z "$PYTHON_CMD" ] && [ -f "/opt/homebrew/bin/python3" ]; then
    PYTHON_CMD="/opt/homebrew/bin/python3"
    echo "🐍 Использую Homebrew Python: $($PYTHON_CMD --version)"
fi

# Если ничего не найдено, используем который в PATH
if [ -z "$PYTHON_CMD" ]; then
    PYTHON_CMD="python3"
    echo "🐍 Использую Python из PATH: $($PYTHON_CMD --version)"
fi

# Проверяем, что Python работает
if ! $PYTHON_CMD --version &> /dev/null; then
    osascript -e 'display dialog "Ошибка: Python 3 не найден." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Проверяем зависимости
if ! $PYTHON_CMD -c "import streamlit" &> /dev/null; then
    osascript -e 'display notification "Устанавливаю зависимости..." with title "Content Reactor"'
    echo "Устанавливаю зависимости..."
    $PYTHON_CMD -m pip install -r requirements.txt --quiet --user
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "Ошибка установки зависимостей. Попробуйте Native версию." buttons {"OK"} default button "OK" with icon stop'
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

# Показываем уведомление о запуске
osascript -e 'display notification "Запускаю Content Reactor..." with title "Content Reactor"'

# Запускаем приложение
$PYTHON_CMD run.py

# Если приложение закрылось, показываем уведомление
osascript -e 'display notification "Content Reactor закрыт" with title "Content Reactor"'
