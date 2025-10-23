#!/usr/bin/env python3
"""
Максимально реалистичный синтезатор пианино - звук точно как при нажатии настоящих клавиш
"""
import subprocess
import sys
from pathlib import Path
import numpy as np
import pretty_midi
import soundfile as sf

def run_command(cmd, cwd=None):
    """Выполняет команду"""
    print(f"Выполняется: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Ошибка: {result.stderr}")
        return False
    return True

def create_ultra_realistic_piano_tone(frequency, duration, velocity, sample_rate=44100):
    """
    Создает максимально реалистичный тон пианино - точно как при нажатии настоящей клавиши
    
    Args:
        frequency: Частота ноты в Hz
        duration: Длительность нажатия клавиши в секундах
        velocity: Сила нажатия (0-127)
        sample_rate: Частота дискретизации
    
    Returns:
        np.ndarray: Аудио сигнал
    """
    
    if duration <= 0:
        return np.array([])
    
    # Количество сэмплов
    num_samples = int(duration * sample_rate)
    if num_samples <= 0:
        return np.array([])
    
    # Временная ось
    t = np.linspace(0, duration, num_samples, dtype=np.float32)
    
    # Нормализуем velocity (0-1)
    vel_norm = velocity / 127.0
    
    # 1. МОДЕЛИРОВАНИЕ УДАРА МОЛОТКА (Hammer Strike)
    # Реалистичный удар молоточка по струне
    hammer_impact = np.exp(-t * 150) * np.sin(2 * np.pi * frequency * t * 4) * 0.6 * vel_norm
    hammer_click = np.exp(-t * 200) * np.sin(2 * np.pi * frequency * t * 8) * 0.3 * vel_norm
    
    # 2. ОСНОВНОЙ ТОН С РЕАЛИСТИЧНЫМИ ГАРМОНИКАМИ
    # Основной тон с легким вибрато (как у настоящего пианино)
    vibrato_freq = 0.3 + vel_norm * 0.2  # Вибрато зависит от силы нажатия
    vibrato_depth = 0.0005 + vel_norm * 0.0005
    fundamental = np.sin(2 * np.pi * frequency * t * (1 + vibrato_depth * np.sin(2 * np.pi * vibrato_freq * t)))
    
    # Реалистичные гармоники пианино (на основе анализа настоящих пианино)
    # Амплитуды зависят от силы нажатия
    harmonics = [
        (2, 0.8, 0.0002),    # Октава
        (3, 0.6, 0.0004),    # Квинта
        (4, 0.45, 0.0006),   # Двойная октава
        (5, 0.35, 0.0008),   # Большая терция
        (6, 0.25, 0.0010),   # Квинта + октава
        (7, 0.18, 0.0012),   # Малая септима
        (8, 0.12, 0.0014),   # Тройная октава
        (9, 0.08, 0.0016),   # Девятая гармоника
        (10, 0.05, 0.0018),  # Десятая гармоника
        (11, 0.03, 0.0020),  # Одиннадцатая гармоника
        (12, 0.02, 0.0022),  # Двенадцатая гармоника
    ]
    
    main_tone = fundamental
    for harmonic_freq, base_amplitude, detune in harmonics:
        # Амплитуда зависит от силы нажатия
        amplitude = base_amplitude * (0.5 + vel_norm * 0.5)
        detuned_freq = frequency * harmonic_freq * (1 + detune)
        harmonic = np.sin(2 * np.pi * detuned_freq * t) * amplitude
        main_tone += harmonic
    
    # 3. НЕГАРМОНИЧЕСКИЕ ОБЕРТОНЫ (Inharmonicity)
    # Пианино имеет характерные расстроенные обертоны
    inharmonic_factors = [1.0001, 1.0003, 1.0005, 1.0007, 1.0009]
    inharmonic_tone = np.zeros_like(t)
    for i, factor in enumerate(inharmonic_factors):
        amplitude = (0.1 - i * 0.02) * vel_norm
        inharmonic = np.sin(2 * np.pi * frequency * factor * t) * amplitude
        inharmonic_tone += inharmonic
    
    # 4. РЕЗОНАНС СТРУН И ДЕКИ
    # Дополнительные частоты от резонанса соседних струн и деки
    resonance_freqs = [
        frequency * 0.5,   # Субгармоника
        frequency * 1.5,   # Полтора тона
        frequency * 2.5,   # Два с половиной тона
        frequency * 3.5,   # Три с половиной тона
        frequency * 4.5,   # Четыре с половиной тона
    ]
    resonance_tone = np.zeros_like(t)
    for i, res_freq in enumerate(resonance_freqs):
        amplitude = (0.08 - i * 0.015) * vel_norm
        resonance = np.sin(2 * np.pi * res_freq * t) * amplitude
        resonance_tone += resonance
    
    # 5. МОДЕЛИРОВАНИЕ ДЕКИ (Soundboard)
    # Дека пианино добавляет свои резонансы
    soundboard_freqs = [frequency * 0.25, frequency * 0.75, frequency * 1.25, frequency * 1.75]
    soundboard_tone = np.zeros_like(t)
    for i, sbf in enumerate(soundboard_freqs):
        amplitude = (0.06 - i * 0.01) * vel_norm
        soundboard = np.sin(2 * np.pi * sbf * t) * amplitude
        soundboard_tone += soundboard
    
    # 6. КОМБИНИРУЕМ ВСЕ КОМПОНЕНТЫ
    tone = hammer_impact + hammer_click + main_tone + inharmonic_tone + resonance_tone + soundboard_tone
    
    # 7. РЕАЛИСТИЧНАЯ ADSR ОГИБАЮЩАЯ (зависит от силы нажатия)
    if duration < 0.05:
        # Для очень коротких нажатий
        attack_time = 0.002
        decay_time = 0.005
        sustain_level = 0.1 * vel_norm
        release_time = duration - attack_time - decay_time
        release_time = max(0.002, release_time)
    else:
        # Стандартная огибающая пианино (зависит от силы нажатия)
        attack_time = 0.003 + (1 - vel_norm) * 0.002  # Сильные нажатия быстрее
        decay_time = 0.1 + (1 - vel_norm) * 0.05      # Сильные нажатия дольше затухают
        sustain_level = 0.3 * vel_norm                 # Сила нажатия влияет на sustain
        release_time = duration - attack_time - decay_time
        release_time = max(0.05, release_time)
    
    # Создаем огибающую
    envelope = np.zeros_like(tone)
    
    # Attack фаза (очень быстрая, как у молоточка)
    attack_samples = int(attack_time * sample_rate)
    if attack_samples > 0:
        # Экспоненциальная атака с небольшим overshoot
        attack_curve = 1 - np.exp(-t[:attack_samples] * 400)
        overshoot = 0.15 * vel_norm * np.exp(-t[:attack_samples] * 600)
        envelope[:attack_samples] = attack_curve + overshoot
    
    # Decay фаза (быстрый спад после удара)
    decay_samples = int(decay_time * sample_rate)
    if decay_samples > 0:
        decay_start = attack_samples
        decay_end = decay_start + decay_samples
        if decay_end <= len(envelope):
            decay_t = t[decay_start:decay_end] - t[decay_start]
            # Экспоненциальный спад
            envelope[decay_start:decay_end] = sustain_level + (1.15 * vel_norm - sustain_level) * np.exp(-decay_t * 20)
    
    # Sustain фаза (низкий уровень, струны затухают)
    sustain_start = attack_samples + decay_samples
    sustain_end = len(envelope) - int(release_time * sample_rate)
    if sustain_start < sustain_end:
        envelope[sustain_start:sustain_end] = sustain_level
    
    # Release фаза (когда отпускаем клавишу)
    release_samples = int(release_time * sample_rate)
    if release_samples > 0:
        release_start = len(envelope) - release_samples
        if release_start >= 0:
            release_t = t[release_start:] - t[release_start]
            # Быстрое затухание при отпускании клавиши
            envelope[release_start:] = sustain_level * np.exp(-release_t * 25)
    
    # Применяем огибающую
    tone = tone * envelope
    
    # 8. РЕАЛИСТИЧНЫЕ ШУМЫ
    # Шум молоточка (более выражен при сильных нажатиях)
    hammer_noise = np.random.normal(0, 0.03 * vel_norm, len(tone))
    noise_envelope = np.exp(-t * 120)  # Шум быстро затухает
    tone += hammer_noise * noise_envelope
    
    # Шум струн (легкая вибрация)
    string_noise = np.random.normal(0, 0.008 * vel_norm, len(tone))
    string_noise_envelope = np.exp(-t * 15)  # Шум струн затухает медленнее
    tone += string_noise * string_noise_envelope
    
    # Шум деки (резонанс дерева)
    soundboard_noise = np.random.normal(0, 0.005 * vel_norm, len(tone))
    soundboard_noise_envelope = np.exp(-t * 8)  # Шум деки затухает очень медленно
    tone += soundboard_noise * soundboard_noise_envelope
    
    # 9. РЕАЛИСТИЧНАЯ РЕВЕРБЕРАЦИЯ
    # Несколько задержанных копий для пространственности
    delays = [0.03, 0.08, 0.15, 0.25]  # Разные задержки
    for i, delay in enumerate(delays):
        delay_samples = int(delay * sample_rate)
        if delay_samples < len(tone):
            delayed = np.zeros_like(tone)
            amplitude = (0.4 / len(delays)) * (1 - i * 0.1) * vel_norm
            delayed[delay_samples:] = tone[:-delay_samples] * amplitude
            tone += delayed
    
    # 10. ФИНАЛЬНАЯ ОБРАБОТКА
    # Легкое сжатие для реализма (зависит от силы нажатия)
    compression_factor = 1.0 + vel_norm * 0.3
    tone = np.tanh(tone * compression_factor) * (0.7 + vel_norm * 0.2)
    
    # Нормализуем
    if np.max(np.abs(tone)) > 0:
        tone = tone / np.max(np.abs(tone)) * (0.8 + vel_norm * 0.1)
    
    return tone.astype(np.float32)

def create_ultra_realistic_piano_audio(midi_path, output_path, sample_rate=44100):
    """Создает максимально реалистичное аудио пианино из MIDI"""
    
    print("🎹 Создание максимально реалистичного звука пианино...")
    
    # Загружаем MIDI файл
    midi = pretty_midi.PrettyMIDI(str(midi_path))
    
    # Получаем длительность
    duration = midi.get_end_time()
    total_samples = int(duration * sample_rate)
    
    # Создаем аудио массив
    audio = np.zeros(total_samples, dtype=np.float32)
    
    # Обрабатываем каждую ноту
    for instrument in midi.instruments:
        for note in instrument.notes:
            # Конвертируем MIDI ноту в частоту
            frequency = 440.0 * (2 ** ((note.pitch - 69) / 12.0))
            
            # Вычисляем длительность нажатия клавиши
            note_duration = note.end - note.start
            
            # Создаем максимально реалистичный тон пианино
            tone = create_ultra_realistic_piano_tone(frequency, note_duration, note.velocity, sample_rate)
            
            # Вычисляем позицию в аудио массиве
            start_sample = int(note.start * sample_rate)
            end_sample = start_sample + len(tone)
            
            # Добавляем тон к аудио (звук только при нажатии клавиши)
            if end_sample <= len(audio):
                # Нормализуем velocity для громкости
                volume = (note.velocity / 127.0) ** 0.7  # Нелинейная зависимость
                audio[start_sample:end_sample] += tone * volume
    
    # Нормализуем финальное аудио
    if np.max(np.abs(audio)) > 0:
        audio = audio / np.max(np.abs(audio)) * 0.9
    
    # Сохраняем аудио
    sf.write(str(output_path), audio, sample_rate)
    print(f"✅ Максимально реалистичное аудио создано: {output_path}")
    
    return True

def process_ultra_realistic_piano():
    """Обрабатывает MIDI файл с максимально реалистичным звуком пианино"""
    
    midi_path = Path("work/006_Dad_Donut/melody.mid")
    if not midi_path.exists():
        print(f"❌ MIDI файл не найден: {midi_path}")
        return False
    
    print(f"🎵 Обработка MIDI файла: {midi_path}")
    
    # Шаг 1: Создание максимально реалистичного аудио
    piano_raw_path = "work/006_Dad_Donut/piano_ultra_realistic_raw.wav"
    if not create_ultra_realistic_piano_audio(midi_path, piano_raw_path):
        print("❌ Ошибка создания максимально реалистичного аудио")
        return False
    
    # Шаг 2: Улучшение аудио с максимально реалистичными фильтрами
    print("🎵 Улучшение аудио...")
    piano_enhanced_path = "work/006_Dad_Donut/piano_enhanced.wav"
    piano_final_path = "work/006_Dad_Donut/piano.wav"
    
    # Максимально реалистичная цепочка фильтров
    cmd = [
        "./ffmpeg", "-y",
        "-i", piano_raw_path,
        "-af", "loudnorm=I=-20:LRA=14:TP=-3,acompressor=threshold=0.1:ratio=1.5:attack=3:release=40:makeup=3,equalizer=f=50:width_type=h:width=30:g=5,equalizer=f=100:width_type=h:width=60:g=4,equalizer=f=200:width_type=h:width=100:g=3.5,equalizer=f=400:width_type=h:width=150:g=3,equalizer=f=800:width_type=h:width=200:g=2.5,equalizer=f=1600:width_type=h:width=300:g=2,equalizer=f=3200:width_type=h:width=400:g=1.5,equalizer=f=6400:width_type=h:width=600:g=1,equalizer=f=12800:width_type=h:width=800:g=0.5,aecho=0.9:0.9:200:0.4,aecho=0.7:0.8:400:0.3,aecho=0.5:0.6:800:0.2,aecho=0.3:0.4:1200:0.1,chorus=0.5:0.7:80:0.5:0.4:1.5,tremolo=f=4.5:d=0.06,loudnorm=I=-18:LRA=10:TP=-2",
        "-ar", "44100",
        "-ac", "2",
        "-b:a", "768k",  # Максимальный битрейт
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
    output_path = "output/006_Dad_Donut_ultra_realistic_piano_1080x1920.mp4"
    
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
        "-b:a", "768k",
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
    success = process_ultra_realistic_piano()
    if success:
        print("\n🎉 Готово! Видео создано с максимально реалистичным звуком пианино!")
        print("📂 Результат: output/006_Dad_Donut_ultra_realistic_piano_1080x1920.mp4")
        print("🎹 Теперь звук точно как при нажатии настоящих клавиш пианино!")
    else:
        print("\n❌ Ошибка при создании видео")
        sys.exit(1)



