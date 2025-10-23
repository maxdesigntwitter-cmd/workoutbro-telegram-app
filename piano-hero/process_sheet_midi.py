#!/usr/bin/env python3
"""
Обработка MIDI файла из нотной записи через существующий pipeline
"""
import sys
import os
from pathlib import Path

# Добавляем путь к модулям
sys.path.append(str(Path(__file__).parent / "src"))

def process_sheet_midi():
    """Обрабатывает MIDI файл из нотной записи"""
    
    # Импортируем модули
    from main import PianoHeroCover
    from config import Config
    import logging
    
    # Настройка логирования
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    # Создаем конфигурацию
    config = Config()
    
    # Создаем основной класс
    piano_hero = PianoHeroCover(config, logger)
    
    # Обрабатываем MIDI файл
    midi_path = Path("work/006_Dad_Donut/melody.mid")
    
    if not midi_path.exists():
        print(f"❌ MIDI файл не найден: {midi_path}")
        return False
    
    print(f"🎵 Обработка MIDI файла: {midi_path}")
    
    # Шаг 2: Синтез пианино-кавера
    print("🎹 Шаг 2: Синтез пианино-кавера...")
    piano_raw_path = Path("work/006_Dad_Donut/piano_raw.wav")
    piano_enhanced_path = Path("work/006_Dad_Donut/piano_enhanced.wav")
    piano_final_path = Path("work/006_Dad_Donut/piano.wav")
    
    if piano_hero.midi_to_audio.synthesize_midi_to_audio(midi_path, piano_raw_path):
        print("✅ Сырое аудио создано")
        
        # Улучшаем аудио
        if piano_hero.midi_to_audio.enhance_audio(piano_raw_path, piano_enhanced_path):
            print("✅ Аудио улучшено")
            
            # Копируем финальное аудио
            import shutil
            shutil.copy2(piano_enhanced_path, piano_final_path)
            print("✅ Финальное аудио готово")
        else:
            print("❌ Ошибка улучшения аудио")
            return False
    else:
        print("❌ Ошибка синтеза аудио")
        return False
    
    # Шаг 3: Создание визуализации
    print("🎬 Шаг 3: Создание визуализации...")
    visual_path = Path("work/006_Dad_Donut/visual.mp4")
    visual_scaled_path = Path("work/006_Dad_Donut/visual_1080x1920.mp4")
    visual_final_path = Path("work/006_Dad_Donut/visual_final.mp4")
    
    if piano_hero.visualizer.create_midi_visualization(midi_path, visual_path):
        print("✅ Визуализация создана")
        
        # Масштабируем видео
        if piano_hero.visualizer.scale_video_to_vertical(visual_path, visual_scaled_path):
            print("✅ Видео масштабировано")
            
            # Создаем финальную визуализацию
            if piano_hero.visualizer.create_final_visualization(visual_scaled_path, visual_final_path):
                print("✅ Финальная визуализация создана")
            else:
                print("❌ Ошибка создания финальной визуализации")
                return False
        else:
            print("❌ Ошибка масштабирования видео")
            return False
    else:
        print("❌ Ошибка создания визуализации")
        return False
    
    # Шаг 4: Финальный монтаж
    print("🎞️ Шаг 4: Финальный монтаж...")
    output_path = Path("output/006_Dad_Donut_from_sheet_piano_1080x1920.mp4")
    
    if piano_hero.postprocessor.combine_video_and_audio(visual_final_path, piano_final_path, output_path):
        print(f"✅ Видео успешно создано: {output_path}")
        return True
    else:
        print("❌ Ошибка финального монтажа")
        return False

if __name__ == "__main__":
    success = process_sheet_midi()
    if success:
        print("\n🎉 Готово! Видео создано на основе нотной записи!")
        print("📂 Результат: output/006_Dad_Donut_from_sheet_piano_1080x1920.mp4")
    else:
        print("\n❌ Ошибка при создании видео")
        sys.exit(1)



