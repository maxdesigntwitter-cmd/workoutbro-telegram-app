#!/bin/bash

# Piano Hero Cover - Скрипт установки для macOS

set -e

echo "🎹 Piano Hero Cover - Установка для macOS"
echo "========================================"

# Проверяем наличие Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew не найден. Устанавливаем..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew найден"
fi

# Обновляем Homebrew
echo "🔄 Обновляем Homebrew..."
brew update

# Устанавливаем системные зависимости
echo "📦 Устанавливаем системные зависимости..."

# FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "Устанавливаем FFmpeg..."
    brew install ffmpeg
else
    echo "✅ FFmpeg уже установлен"
fi

# FluidSynth
if ! command -v fluidsynth &> /dev/null; then
    echo "Устанавливаем FluidSynth..."
    brew install fluidsynth
else
    echo "✅ FluidSynth уже установлен"
fi

# Python 3.10+
if ! command -v python3 &> /dev/null; then
    echo "Устанавливаем Python 3..."
    brew install python@3.11
else
    echo "✅ Python 3 уже установлен"
fi

# Проверяем версию Python
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.10"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Python версия $PYTHON_VERSION подходит"
else
    echo "❌ Требуется Python 3.10+, найдена версия $PYTHON_VERSION"
    exit 1
fi

# Создаем виртуальное окружение
echo "🐍 Создаем виртуальное окружение..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✅ Виртуальное окружение создано"
else
    echo "✅ Виртуальное окружение уже существует"
fi

# Активируем виртуальное окружение
echo "🔄 Активируем виртуальное окружение..."
source .venv/bin/activate

# Обновляем pip
echo "📦 Обновляем pip..."
pip install --upgrade pip

# Устанавливаем Python зависимости
echo "📦 Устанавливаем Python зависимости..."
pip install -r requirements.txt

# Создаем необходимые директории
echo "📁 Создаем директории..."
mkdir -p input output work assets configs

# Скачиваем SoundFont для пианино
echo "🎵 Скачиваем SoundFont для пианино..."
if [ ! -f "assets/piano.sf2" ]; then
    echo "Скачиваем FluidR3_GM.sf2..."
    curl -L -o assets/piano.sf2 "https://musical-artifacts.com/artifacts/1/fluidr3_gm.sf2"
    echo "✅ SoundFont скачан"
else
    echo "✅ SoundFont уже существует"
fi

# Скачиваем MidiVisualizer
echo "🎬 Скачиваем MidiVisualizer..."
if [ ! -d "MidiVisualizer" ]; then
    echo "Скачиваем MidiVisualizer..."
    curl -L -o MidiVisualizer.zip "https://github.com/kosua20/MidiVisualizer/releases/latest/download/MidiVisualizer-macOS.zip"
    unzip -q MidiVisualizer.zip
    rm MidiVisualizer.zip
    chmod +x MidiVisualizer/midivisualizer
    echo "✅ MidiVisualizer установлен"
else
    echo "✅ MidiVisualizer уже установлен"
fi

# Создаем пример видео для тестирования
echo "📹 Создаем пример видео для тестирования..."
if [ ! -f "input/example.mp4" ]; then
    echo "Создаем тестовое видео..."
    ffmpeg -f lavfi -i "sine=frequency=440:duration=5" -f lavfi -i "color=size=1920x1080:duration=5:color=black" -c:v libx264 -c:a aac -shortest input/example.mp4 -y
    echo "✅ Тестовое видео создано"
else
    echo "✅ Тестовое видео уже существует"
fi

echo ""
echo "🎉 Установка завершена!"
echo ""
echo "Для запуска:"
echo "1. source .venv/bin/activate"
echo "2. python -m src.main --input input/example.mp4"
echo ""
echo "Для пакетной обработки:"
echo "python -m src.main --input input/ --output output/"
echo ""
echo "Документация: README.md"



