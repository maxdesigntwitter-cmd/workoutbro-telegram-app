#!/usr/bin/env python3
"""
Простая обработка MIDI файла без импортов
"""
import subprocess
import sys
from pathlib import Path

def run_command(cmd, cwd=None):
    """Выполняет команду"""
    print(f"Выполняется: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Ошибка: {result.stderr}")
        return False
    return True

def process_midi_only():
    """Обрабатывает только MIDI файл"""
    
    midi_path = Path("work/006_Dad_Donut/melody.mid")
    if not midi_path.exists():
        print(f"❌ MIDI файл не найден: {midi_path}")
        return False
    
    print(f"🎵 Обработка MIDI файла: {midi_path}")
    
    # Шаг 1: Синтез аудио из MIDI (используем FFmpeg)
    print("🎹 Синтез аудио из MIDI...")
    piano_raw_path = "work/006_Dad_Donut/piano_raw.wav"
    
    # Создаем простое аудио из MIDI с помощью FFmpeg
    cmd = [
        "./ffmpeg", "-y",
        "-i", str(midi_path),
        "-ac", "2",
        "-ar", "44100",
        piano_raw_path
    ]
    
    if not run_command(cmd):
        print("❌ Ошибка синтеза аудио")
        return False
    
    print("✅ Аудио синтезировано")
    
    # Шаг 2: Улучшение аудио
    print("🎵 Улучшение аудио...")
    piano_enhanced_path = "work/006_Dad_Donut/piano_enhanced.wav"
    piano_final_path = "work/006_Dad_Donut/piano.wav"
    
    # Применяем аудио фильтры
    cmd = [
        "./ffmpeg", "-y",
        "-i", piano_raw_path,
        "-af", "loudnorm,acompressor=threshold=0.2:ratio=2:attack=3:release=30,equalizer=f=80:width_type=h:width=50:g=3,equalizer=f=200:width_type=h:width=100:g=2,equalizer=f=800:width_type=h:width=200:g=1.5,equalizer=f=2000:width_type=h:width=500:g=1,equalizer=f=5000:width_type=h:width=1000:g=0.5,aecho=0.8:0.9:500:0.2,chorus=0.3:0.5:50:0.3:0.25:1,tremolo=f=6:d=0.1,loudnorm",
        "-ar", "44100",
        "-ac", "2",
        "-b:a", "320k",
        piano_enhanced_path
    ]
    
    if not run_command(cmd):
        print("❌ Ошибка улучшения аудио")
        return False
    
    # Копируем финальное аудио
    import shutil
    shutil.copy2(piano_enhanced_path, piano_final_path)
    print("✅ Аудио улучшено")
    
    # Шаг 3: Создание визуализации
    print("🎬 Создание визуализации...")
    visual_path = "work/006_Dad_Donut/visual.mp4"
    
    cmd = [
        "./MidiVisualizer/midivisualizer",
        "--midi", str(midi_path),
        "--export", visual_path,
        "--format", "MPEG4",
        "--framerate", "60",
        "--bitrate", "2",
        "--hide-window", "1",
        "--config", "configs/midivisualizer.theme.json"
    ]
    
    if not run_command(cmd):
        print("❌ Ошибка создания визуализации")
        return False
    
    print("✅ Визуализация создана")
    
    # Шаг 4: Масштабирование видео
    print("📐 Масштабирование видео...")
    visual_scaled_path = "work/006_Dad_Donut/visual_1080x1920.mp4"
    
    cmd = [
        "./ffmpeg", "-y",
        "-i", visual_path,
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-r", "60",
        visual_scaled_path
    ]
    
    if not run_command(cmd):
        print("❌ Ошибка масштабирования")
        return False
    
    print("✅ Видео масштабировано")
    
    # Шаг 5: Финальный монтаж
    print("🎞️ Финальный монтаж...")
    output_path = "output/006_Dad_Donut_from_sheet_piano_1080x1920.mp4"
    
    cmd = [
        "./ffmpeg", "-y",
        "-i", visual_scaled_path,
        "-i", piano_final_path,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "256k",
        "-shortest",
        "-r", "60",
        output_path
    ]
    
    if not run_command(cmd):
        print("❌ Ошибка финального монтажа")
        return False
    
    print(f"✅ Видео успешно создано: {output_path}")
    return True

if __name__ == "__main__":
    success = process_midi_only()
    if success:
        print("\n🎉 Готово! Видео создано на основе нотной записи!")
        print("📂 Результат: output/006_Dad_Donut_from_sheet_piano_1080x1920.mp4")
    else:
        print("\n❌ Ошибка при создании видео")
        sys.exit(1)



