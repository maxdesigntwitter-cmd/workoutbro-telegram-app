#!/usr/bin/env python3
"""
Обработка MIDI файла с максимально реалистичным звуком пианино
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

def create_realistic_piano_audio(midi_path, output_path, sample_rate=44100):
    """Создает максимально реалистичное аудио пианино из MIDI"""
    
    print("🎹 Создание реалистичного звука пианино...")
    
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
            
            # Вычисляем длительность ноты
            note_duration = note.end - note.start
            
            # Создаем реалистичный тон пианино
            tone = create_realistic_piano_tone(frequency, note_duration, sample_rate)
            
            # Вычисляем позицию в аудио массиве
            start_sample = int(note.start * sample_rate)
            end_sample = start_sample + len(tone)
            
            # Добавляем тон к аудио
            if end_sample <= len(audio):
                audio[start_sample:end_sample] += tone * (note.velocity / 127.0)
    
    # Нормализуем аудио
    if np.max(np.abs(audio)) > 0:
        audio = audio / np.max(np.abs(audio)) * 0.8
    
    # Сохраняем аудио
    sf.write(str(output_path), audio, sample_rate)
    print(f"✅ Реалистичное аудио создано: {output_path}")
    
    return True

def create_realistic_piano_tone(frequency, duration, sample_rate=44100):
    """Создает максимально реалистичный тон пианино"""
    
    if duration <= 0:
        return np.array([])
    
    # Количество сэмплов
    num_samples = int(duration * sample_rate)
    if num_samples <= 0:
        return np.array([])
    
    # Временная ось
    t = np.linspace(0, duration, num_samples, dtype=np.float32)
    
    # 1. МОДЕЛИРОВАНИЕ УДАРА МОЛОТКА
    hammer_attack_1 = np.exp(-t * 80) * np.sin(2 * np.pi * frequency * t * 3) * 0.4
    hammer_attack_2 = np.exp(-t * 120) * np.sin(2 * np.pi * frequency * t * 5) * 0.2
    hammer_attack = hammer_attack_1 + hammer_attack_2
    
    # 2. ОСНОВНОЙ ТОН С РЕАЛИСТИЧНЫМИ ГАРМОНИКАМИ
    fundamental_vibrato = 0.5  # Hz
    fundamental = np.sin(2 * np.pi * frequency * t * (1 + 0.001 * np.sin(2 * np.pi * fundamental_vibrato * t)))
    
    # Реалистичные гармоники пианино
    harmonics = [
        (2, 0.7, 0.0003),    # Октава с легким расстройом
        (3, 0.5, 0.0005),    # Квинта
        (4, 0.35, 0.0007),   # Двойная октава
        (5, 0.25, 0.0009),   # Большая терция
        (6, 0.18, 0.0011),   # Квинта + октава
        (7, 0.12, 0.0013),   # Малая септима
        (8, 0.08, 0.0015),   # Тройная октава
        (9, 0.05, 0.0017),   # Девятая гармоника
        (10, 0.03, 0.0019),  # Десятая гармоника
    ]
    
    main_tone = fundamental
    for harmonic_freq, amplitude, detune in harmonics:
        detuned_freq = frequency * harmonic_freq * (1 + detune)
        harmonic = np.sin(2 * np.pi * detuned_freq * t) * amplitude
        main_tone += harmonic
    
    # 3. НЕГАРМОНИЧЕСКИЕ ОБЕРТОНЫ
    inharmonic_factors = [1.0002, 1.0004, 1.0006, 1.0008]
    inharmonic_tone = np.zeros_like(t)
    for i, factor in enumerate(inharmonic_factors):
        inharmonic = np.sin(2 * np.pi * frequency * factor * t) * (0.08 - i * 0.02)
        inharmonic_tone += inharmonic
    
    # 4. РЕЗОНАНС СТРУН И ДЕКИ
    resonance_freqs = [
        frequency * 0.5,   # Субгармоника
        frequency * 1.5,   # Полтора тона
        frequency * 2.5,   # Два с половиной тона
        frequency * 3.5,   # Три с половиной тона
    ]
    resonance_tone = np.zeros_like(t)
    for i, res_freq in enumerate(resonance_freqs):
        resonance = np.sin(2 * np.pi * res_freq * t) * (0.06 - i * 0.01)
        resonance_tone += resonance
    
    # 5. МОДЕЛИРОВАНИЕ ДЕКИ
    soundboard_freqs = [frequency * 0.25, frequency * 0.75, frequency * 1.25]
    soundboard_tone = np.zeros_like(t)
    for sbf in soundboard_freqs:
        soundboard = np.sin(2 * np.pi * sbf * t) * 0.04
        soundboard_tone += soundboard
    
    # 6. КОМБИНИРУЕМ ВСЕ КОМПОНЕНТЫ
    tone = hammer_attack + main_tone + inharmonic_tone + resonance_tone + soundboard_tone
    
    # 7. РЕАЛИСТИЧНАЯ ADSR ОГИБАЮЩАЯ
    if duration < 0.1:
        attack_time = 0.003
        decay_time = 0.008
        sustain_level = 0.15
        release_time = duration - attack_time - decay_time
        release_time = max(0.003, release_time)
    else:
        attack_time = 0.005
        decay_time = 0.08
        sustain_level = 0.25
        release_time = duration - attack_time - decay_time
        release_time = max(0.1, release_time)
    
    # Создаем огибающую
    envelope = np.zeros_like(tone)
    
    # Attack фаза с overshoot
    attack_samples = int(attack_time * sample_rate)
    if attack_samples > 0:
        attack_curve = 1 - np.exp(-t[:attack_samples] * 300)
        overshoot = 0.1 * np.exp(-t[:attack_samples] * 500)
        envelope[:attack_samples] = attack_curve + overshoot
    
    # Decay фаза
    decay_samples = int(decay_time * sample_rate)
    if decay_samples > 0:
        decay_start = attack_samples
        decay_end = decay_start + decay_samples
        if decay_end <= len(envelope):
            decay_t = t[decay_start:decay_end] - t[decay_start]
            envelope[decay_start:decay_end] = sustain_level + (1.1 - sustain_level) * np.exp(-decay_t * 25)
    
    # Sustain фаза
    sustain_start = attack_samples + decay_samples
    sustain_end = len(envelope) - int(release_time * sample_rate)
    if sustain_start < sustain_end:
        envelope[sustain_start:sustain_end] = sustain_level
    
    # Release фаза
    release_samples = int(release_time * sample_rate)
    if release_samples > 0:
        release_start = len(envelope) - release_samples
        if release_start >= 0:
            release_t = t[release_start:] - t[release_start]
            envelope[release_start:] = sustain_level * np.exp(-release_t * 15)
    
    # Применяем огибающую
    tone = tone * envelope
    
    # Добавляем реалистичный шум молоточка
    hammer_noise = np.random.normal(0, 0.02, len(tone))
    noise_envelope = np.exp(-t * 100)
    tone += hammer_noise * noise_envelope
    
    # Добавляем шум струн
    string_noise = np.random.normal(0, 0.005, len(tone))
    string_noise_envelope = np.exp(-t * 20)
    tone += string_noise * string_noise_envelope
    
    # Простая реверберация
    delays = [0.05, 0.1, 0.15]
    for delay in delays:
        delay_samples = int(delay * sample_rate)
        if delay_samples < len(tone):
            delayed = np.zeros_like(tone)
            delayed[delay_samples:] = tone[:-delay_samples] * (0.3 / len(delays))
            tone += delayed
    
    # Финальная обработка
    tone = np.tanh(tone * 1.2) * 0.8
    
    # Нормализуем
    if np.max(np.abs(tone)) > 0:
        tone = tone / np.max(np.abs(tone)) * 0.85
    
    return tone.astype(np.float32)

def process_realistic_piano():
    """Обрабатывает MIDI файл с максимально реалистичным звуком пианино"""
    
    midi_path = Path("work/006_Dad_Donut/melody.mid")
    if not midi_path.exists():
        print(f"❌ MIDI файл не найден: {midi_path}")
        return False
    
    print(f"🎵 Обработка MIDI файла: {midi_path}")
    
    # Шаг 1: Создание реалистичного аудио
    piano_raw_path = "work/006_Dad_Donut/piano_realistic_raw.wav"
    if not create_realistic_piano_audio(midi_path, piano_raw_path):
        print("❌ Ошибка создания реалистичного аудио")
        return False
    
    # Шаг 2: Улучшение аудио с максимально реалистичными фильтрами
    print("🎵 Улучшение аудио...")
    piano_enhanced_path = "work/006_Dad_Donut/piano_enhanced.wav"
    piano_final_path = "work/006_Dad_Donut/piano.wav"
    
    # Максимально реалистичная цепочка фильтров (без overdrive)
    cmd = [
        "./ffmpeg", "-y",
        "-i", piano_raw_path,
        "-af", "loudnorm=I=-18:LRA=12:TP=-2,acompressor=threshold=0.15:ratio=1.8:attack=5:release=50:makeup=2,equalizer=f=60:width_type=h:width=40:g=4,equalizer=f=120:width_type=h:width=80:g=3,equalizer=f=250:width_type=h:width=120:g=2.5,equalizer=f=500:width_type=h:width=200:g=2,equalizer=f=1000:width_type=h:width=400:g=1.5,equalizer=f=2000:width_type=h:width=600:g=1,equalizer=f=4000:width_type=h:width=800:g=0.8,equalizer=f=8000:width_type=h:width=1200:g=0.5,aecho=0.8:0.9:300:0.3,aecho=0.6:0.7:600:0.2,aecho=0.4:0.5:900:0.1,chorus=0.4:0.6:60:0.4:0.3:1.2,tremolo=f=5.5:d=0.08,loudnorm=I=-16:LRA=8:TP=-1.5",
        "-ar", "44100",
        "-ac", "2",
        "-b:a", "512k",
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
    output_path = "output/006_Dad_Donut_realistic_piano_1080x1920.mp4"
    
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
        "-b:a", "512k",
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
    success = process_realistic_piano()
    if success:
        print("\n🎉 Готово! Видео создано с максимально реалистичным звуком пианино!")
        print("📂 Результат: output/006_Dad_Donut_realistic_piano_1080x1920.mp4")
    else:
        print("\n❌ Ошибка при создании видео")
        sys.exit(1)
