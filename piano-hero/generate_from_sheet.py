#!/usr/bin/env python3
"""
Генерация видео Piano Hero на основе нотной записи
"""
import sys
import os
from pathlib import Path

# Добавляем путь к модулям
sys.path.append(str(Path(__file__).parent / "src"))

from midi_to_audio_simple import SimpleMidiToAudioConverter
from postprocess import PostProcessor
from config import Config
import logging

def setup_logging():
    """Настройка логирования"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

def generate_video_from_sheet():
    """Генерирует видео на основе нотной записи"""
    
    logger = setup_logging()
    config = Config()
    
    # Создаем MIDI файл из нотной записи
    logger.info("Создание MIDI файла из нотной записи...")
    from create_midi_from_sheet import create_midi_from_sheet
    midi_path = create_midi_from_sheet()
    
    # Создаем конвертер MIDI в аудио
    midi_to_audio = SimpleMidiToAudioConverter(config, logger)
    
    # Синтезируем аудио из MIDI
    logger.info("Синтез пианино-аудио...")
    piano_raw_path = Path("work/006_Dad_Donut/piano_from_sheet_raw.wav")
    piano_enhanced_path = Path("work/006_Dad_Donut/piano_from_sheet.wav")
    
    if midi_to_audio.synthesize_midi_to_audio(midi_path, piano_raw_path):
        logger.info("Сырое аудио создано")
        
        # Улучшаем аудио
        if midi_to_audio.enhance_audio(piano_raw_path, piano_enhanced_path):
            logger.info("Аудио улучшено")
        else:
            logger.error("Ошибка улучшения аудио")
            return False
    else:
        logger.error("Ошибка синтеза аудио")
        return False
    
    # Создаем визуализацию
    logger.info("Создание визуализации...")
    postprocessor = PostProcessor(config, logger)
    
    # Создаем визуализацию MIDI
    visual_path = Path("work/006_Dad_Donut/visual_from_sheet.mp4")
    if postprocessor.create_midi_visualization(midi_path, visual_path):
        logger.info("Визуализация создана")
    else:
        logger.error("Ошибка создания визуализации")
        return False
    
    # Финальный монтаж
    logger.info("Финальный монтаж...")
    output_path = Path("output/006_Dad_Donut_from_sheet_piano_1080x1920.mp4")
    
    if postprocessor.combine_video_and_audio(visual_path, piano_enhanced_path, output_path):
        logger.info(f"✅ Видео успешно создано: {output_path}")
        return True
    else:
        logger.error("Ошибка финального монтажа")
        return False

if __name__ == "__main__":
    success = generate_video_from_sheet()
    if success:
        print("\n🎉 Готово! Видео создано на основе нотной записи!")
        print("📂 Результат: output/006_Dad_Donut_from_sheet_piano_1080x1920.mp4")
    else:
        print("\n❌ Ошибка при создании видео")
        sys.exit(1)



