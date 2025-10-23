# 🎹 Piano Hero Cover

Автоматический генератор вертикальных видео с фортепианной анимацией и синтезированным звуком кавера на основе исходного видео.

## 🎯 Описание

Piano Hero Cover превращает любое входное видео в вертикальное видео 1080×1920 с:
- Падающими нотами как в Guitar Hero
- Клавиатурой пианино внизу
- Автоматически сгенерированным пианино-кавером
- Без текста, подписей и водяных знаков

## ✨ Особенности

- **Полная автоматизация** - от входного видео до готового результата
- **Высокое качество** - 1080×1920, 60 FPS
- **Бесплатные инструменты** - FFmpeg, Basic Pitch, FluidSynth, MidiVisualizer
- **Кроссплатформенность** - macOS и Linux
- **Пакетная обработка** - обработка целых папок
- **Настраиваемые темы** - кастомизация цветов и стилей

## 🏗️ Архитектура

```
Входное видео → Аудио → MIDI → Пианино-кавер + Визуализация → Финальное видео
```

### Основные компоненты:
1. **Извлечение аудио** - FFmpeg
2. **Аудио → MIDI** - Basic Pitch (Spotify)
3. **MIDI → Пианино** - FluidSynth + SoundFont
4. **Визуализация** - MidiVisualizer
5. **Финальный монтаж** - FFmpeg

## 📋 Требования

### Системные зависимости:
- **FFmpeg** - обработка видео и аудио
- **FluidSynth** - синтез MIDI в аудио
- **Python 3.10+** - основной язык
- **MidiVisualizer** - визуализация MIDI

### Python зависимости:
- basic-pitch - конвертация аудио в MIDI
- pretty-midi - обработка MIDI
- numpy, scipy - численные вычисления
- PyYAML - конфигурация

## 🚀 Быстрая установка

### macOS
```bash
git clone <repository>
cd piano-hero
bash scripts/install_mac.sh
```

### Linux
```bash
git clone <repository>
cd piano-hero
bash scripts/install_linux.sh
```

## 📖 Использование

### Активация окружения
```bash
source .venv/bin/activate
```

### Обработка одного видео
```bash
python -m src.main --input input/video.mp4
```

### Пакетная обработка
```bash
python -m src.main --input input/ --output output/
```

### Дополнительные опции
```bash
python -m src.main --input input/video.mp4 \
  --output output/ \
  --fps 60 \
  --keep-workdir \
  --verbose
```

## ⚙️ Конфигурация

### Основные настройки (`configs/settings.yaml`)
```yaml
# Видео параметры
fps: 60
target_width: 1080
target_height: 1920

# Аудио параметры
audio_bitrate: "256k"
sample_rate: 44100
midi_gain: 0.9

# Кодирование
crf: 18
preset: "medium"
```

### Тема визуализации (`configs/midivisualizer.theme.json`)
```json
{
  "keyboard": {
    "drawKeys": true,
    "drawKeyLabels": false,
    "height": 180
  },
  "theme": {
    "backgroundColor": "#0B0B0B",
    "noteColor": "#FFD447",
    "highlightColor": "#FFE37A",
    "whiteKeyColor": "#FFFFFF",
    "blackKeyColor": "#111111"
  }
}
```

## 📁 Структура проекта

```
piano-hero/
├── input/                    # Исходные видео
├── output/                   # Готовые видео
├── work/                     # Временные файлы
├── assets/
│   └── piano.sf2            # SoundFont пианино
├── configs/
│   ├── settings.yaml        # Основные настройки
│   └── midivisualizer.theme.json  # Тема визуализации
├── src/
│   ├── main.py              # CLI интерфейс
│   ├── audio_to_midi.py     # Конвертация аудио в MIDI
│   ├── midi_to_audio.py     # Синтез пианино-кавера
│   ├── visualize_midi.py    # Создание визуализации
│   ├── postprocess.py       # Финальный монтаж
│   ├── utils.py             # Утилиты
│   └── config.py            # Управление конфигурацией
├── scripts/
│   ├── install_mac.sh       # Установка для macOS
│   └── install_linux.sh     # Установка для Linux
├── requirements.txt         # Python зависимости
└── README.md               # Документация
```

## 🎨 Настройка темы

Вы можете настроить внешний вид визуализации, изменив файл `configs/midivisualizer.theme.json`:

- `backgroundColor` - цвет фона
- `noteColor` - цвет падающих нот
- `highlightColor` - цвет подсветки
- `whiteKeyColor` - цвет белых клавиш
- `blackKeyColor` - цвет черных клавиш
- `noteHeight` - высота нот
- `noteOpacity` - прозрачность нот

## 🔧 CLI Опции

| Опция | Описание |
|-------|----------|
| `--input, -i` | Путь к входному видео или директории |
| `--output, -o` | Выходная директория (по умолчанию: ./output) |
| `--config, -c` | Путь к конфигурационному файлу |
| `--keep-workdir` | Сохранять рабочие директории |
| `--fps` | FPS для выходного видео |
| `--theme` | Путь к файлу темы |
| `--verbose, -v` | Подробный вывод |

## 🐛 Устранение неполадок

### Ошибка "FFmpeg не найден"
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

### Ошибка "FluidSynth не найден"
```bash
# macOS
brew install fluidsynth

# Ubuntu/Debian
sudo apt install fluidsynth

# CentOS/RHEL
sudo yum install fluidsynth
```

### Ошибка "MidiVisualizer не найден"
Скрипт установки автоматически скачивает MidiVisualizer. Если проблема остается:
```bash
# Скачать вручную
curl -L -o MidiVisualizer.zip "https://github.com/kosua20/MidiVisualizer/releases/latest/download/MidiVisualizer-macOS.zip"
unzip MidiVisualizer.zip
chmod +x MidiVisualizer/midivisualizer
```

### Ошибка "SoundFont не найден"
```bash
# Скачать SoundFont
curl -L -o assets/piano.sf2 "https://musical-artifacts.com/artifacts/1/fluidr3_gm.sf2"
```

### Проблемы с Python зависимостями
```bash
# Переустановить зависимости
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📊 Производительность

### Рекомендуемые системные требования:
- **CPU**: 4+ ядра
- **RAM**: 8+ GB
- **Диск**: 10+ GB свободного места
- **GPU**: Не требуется (CPU обработка)

### Время обработки:
- 1 минута видео ≈ 2-5 минут обработки
- Зависит от сложности аудио и мощности системы

## 🎵 Поддерживаемые форматы

### Входные видео:
- MP4, AVI, MOV, MKV, WebM, FLV
- Любое разрешение
- Любая длительность

### Выходные видео:
- MP4 (H.264)
- 1080×1920 (вертикально)
- 60 FPS
- AAC аудио

## 🔄 Обновление

```bash
git pull origin main
source .venv/bin/activate
pip install -r requirements.txt --upgrade
```

## 📝 Лицензия

Этот проект использует бесплатные инструменты с открытым исходным кодом:
- FFmpeg (LGPL)
- Basic Pitch (Apache 2.0)
- FluidSynth (LGPL)
- MidiVisualizer (MIT)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

При возникновении проблем:
1. Проверьте раздел "Устранение неполадок"
2. Создайте Issue с подробным описанием
3. Приложите логи ошибок

## 🎉 Примеры использования

### Создание кавера для TikTok
```bash
python -m src.main --input input/song.mp4 --output output/ --fps 60
```

### Пакетная обработка альбома
```bash
python -m src.main --input input/album/ --output output/album_covers/
```

### Настройка под мобильные устройства
```bash
python -m src.main --input input/video.mp4 --output output/ --fps 30
```

---

**Piano Hero Cover** - превращайте любую музыку в визуальное пианино-шоу! 🎹✨



