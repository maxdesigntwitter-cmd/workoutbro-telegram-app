# 🚀 Быстрый старт - Piano Hero Cover

## 1. Установка (5 минут)

### macOS:
```bash
cd piano-hero
bash scripts/install_mac.sh
```

### Linux:
```bash
cd piano-hero
bash scripts/install_linux.sh
```

## 2. Активация окружения
```bash
source .venv/bin/activate
```

## 3. Тестовый запуск
```bash
python -m src.main --input input/example.mp4
```

## 4. Обработка вашего видео
```bash
# Поместите ваше видео в папку input/
cp /path/to/your/video.mp4 input/

# Запустите обработку
python -m src.main --input input/your_video.mp4
```

## 5. Результат
Готовое видео будет в папке `output/` с именем `your_video_piano_1080x1920.mp4`

## 🎯 Что получится:
- ✅ Размер: 1080×1920 (вертикально)
- ✅ FPS: 60
- ✅ Внизу клавиатура пианино
- ✅ Сверху падающие жёлтые ноты
- ✅ Звук: пианино-кавер (не оригинал)
- ✅ Без текста и водяных знаков

## 🔧 Полезные команды:

### Пакетная обработка:
```bash
python -m src.main --input input/ --output output/
```

### С подробным выводом:
```bash
python -m src.main --input input/video.mp4 --verbose
```

### Сохранить рабочие файлы для отладки:
```bash
python -m src.main --input input/video.mp4 --keep-workdir
```

## ❗ Если что-то не работает:

1. **Проверьте зависимости:**
   ```bash
   ffmpeg -version
   fluidsynth --version
   ```

2. **Переустановите Python зависимости:**
   ```bash
   source .venv/bin/activate
   pip install -r requirements.txt --force-reinstall
   ```

3. **Проверьте логи:**
   ```bash
   tail -f piano_hero.log
   ```

## 📞 Нужна помощь?
- Читайте полную документацию: `README.md`
- Проверьте раздел "Устранение неполадок"
- Создайте Issue с описанием проблемы

---
**Готово! Теперь вы можете создавать Piano Hero Cover видео! 🎹✨**



