#!/usr/bin/env python3
"""
Создание MIDI файла на основе нотной записи для 006_Dad_Donut
"""
import pretty_midi
import numpy as np
from pathlib import Path

def create_midi_from_sheet():
    """Создает MIDI файл на основе нотной записи"""
    
    # Создаем новый MIDI объект
    midi = pretty_midi.PrettyMIDI()
    
    # Создаем инструмент (пианино)
    piano = pretty_midi.Instrument(program=0)  # Acoustic Grand Piano
    
    # Темп: ♩ = 108 BPM
    tempo = 108
    midi.time_signature_changes.append(pretty_midi.TimeSignature(3, 4, 0))
    
    # Ключевая сигнатура: 4 диеза (E major / C# minor)
    # F#, C#, G#, D#
    
    # Определяем ноты на основе нотной записи
    # Время в секундах (при темпе 108 BPM)
    beat_duration = 60.0 / tempo  # Длительность четверти
    
    notes_data = [
        # Measure 1: dotted eighth + sixteenth rest
        {'pitch': 64, 'start': 0.0, 'duration': beat_duration * 0.75, 'velocity': 80},  # E4
        
        # Measure 2: E chord
        {'pitch': 64, 'start': beat_duration * 1.0, 'duration': beat_duration * 0.5, 'velocity': 80},  # E4
        {'pitch': 68, 'start': beat_duration * 1.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # G#4
        {'pitch': 71, 'start': beat_duration * 1.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # B4
        {'pitch': 64, 'start': beat_duration * 1.5, 'duration': beat_duration * 0.5, 'velocity': 80},  # E4
        
        # Measure 3: B chord
        {'pitch': 67, 'start': beat_duration * 2.0, 'duration': beat_duration * 0.5, 'velocity': 80},  # G4
        {'pitch': 71, 'start': beat_duration * 2.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # B4
        {'pitch': 74, 'start': beat_duration * 2.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # D5
        {'pitch': 67, 'start': beat_duration * 2.5, 'duration': beat_duration * 0.5, 'velocity': 80},  # G4
        
        # Measure 4: E chord
        {'pitch': 64, 'start': beat_duration * 3.0, 'duration': beat_duration * 0.5, 'velocity': 80},  # E4
        {'pitch': 68, 'start': beat_duration * 3.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # G#4
        {'pitch': 71, 'start': beat_duration * 3.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # B4
        {'pitch': 64, 'start': beat_duration * 3.5, 'duration': beat_duration * 0.5, 'velocity': 80},  # E4
        
        # Measure 5: E7 chord
        {'pitch': 64, 'start': beat_duration * 4.0, 'duration': beat_duration * 0.5, 'velocity': 80},  # E4
        {'pitch': 68, 'start': beat_duration * 4.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # G#4
        {'pitch': 71, 'start': beat_duration * 4.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # B4
        {'pitch': 73, 'start': beat_duration * 4.0, 'duration': beat_duration * 0.5, 'velocity': 60},  # C#5 (7th)
        {'pitch': 64, 'start': beat_duration * 4.5, 'duration': beat_duration * 0.5, 'velocity': 80},  # E4
        
        # Measure 6: A chord
        {'pitch': 69, 'start': beat_duration * 5.0, 'duration': beat_duration * 0.5, 'velocity': 80},  # A4
        {'pitch': 73, 'start': beat_duration * 5.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # C#5
        {'pitch': 76, 'start': beat_duration * 5.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # E5
        {'pitch': 69, 'start': beat_duration * 5.5, 'duration': beat_duration * 0.5, 'velocity': 80},  # A4
        
        # Measure 7: B chord
        {'pitch': 67, 'start': beat_duration * 6.0, 'duration': beat_duration * 0.5, 'velocity': 80},  # G4
        {'pitch': 71, 'start': beat_duration * 6.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # B4
        {'pitch': 74, 'start': beat_duration * 6.0, 'duration': beat_duration * 0.5, 'velocity': 70},  # D5
        {'pitch': 67, 'start': beat_duration * 6.5, 'duration': beat_duration * 0.5, 'velocity': 80},  # G4
        
        # Measure 8: Final E chord
        {'pitch': 64, 'start': beat_duration * 7.0, 'duration': beat_duration * 1.0, 'velocity': 80},  # E4
        {'pitch': 68, 'start': beat_duration * 7.0, 'duration': beat_duration * 1.0, 'velocity': 70},  # G#4
        {'pitch': 71, 'start': beat_duration * 7.0, 'duration': beat_duration * 1.0, 'velocity': 70},  # B4
    ]
    
    # Добавляем ноты в инструмент
    for note_data in notes_data:
        note = pretty_midi.Note(
            velocity=note_data['velocity'],
            pitch=note_data['pitch'],
            start=note_data['start'],
            end=note_data['start'] + note_data['duration']
        )
        piano.notes.append(note)
    
    # Добавляем инструмент в MIDI
    midi.instruments.append(piano)
    
    # Сохраняем MIDI файл
    output_path = Path("work/006_Dad_Donut/melody_from_sheet.mid")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    midi.write(str(output_path))
    
    print(f"MIDI файл создан: {output_path}")
    print(f"Длительность: {midi.get_end_time():.2f} секунд")
    print(f"Количество нот: {len(piano.notes)}")
    
    return output_path

if __name__ == "__main__":
    create_midi_from_sheet()



