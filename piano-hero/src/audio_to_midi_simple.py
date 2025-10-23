"""
Упрощенный модуль для конвертации аудио в MIDI (без Basic Pitch)
Использует librosa для анализа аудио и создает простой MIDI
"""
import logging
import numpy as np
from pathlib import Path
from typing import Optional
import librosa
import pretty_midi
from .utils import run_command


class SimpleAudioToMidiConverter:
    """Упрощенный класс для конвертации аудио в MIDI"""
    
    def __init__(self, config, logger: Optional[logging.Logger] = None):
        self.config = config
        self.logger = logger or logging.getLogger(__name__)
    
    def extract_audio_from_video(self, video_path: Path, output_path: Path) -> bool:
        """
        Извлекает аудио из видео файла
        
        Args:
            video_path: Путь к видео файлу
            output_path: Путь для сохранения аудио
        
        Returns:
            bool: True если успешно
        """
        command = [
            './ffmpeg', '-y',
            '-i', str(video_path),
            '-vn',  # без видео
            '-ac', '2',  # стерео
            '-ar', str(self.config.sample_rate),
            '-b:a', '192k',
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Аудио извлечено: {output_path}")
        else:
            self.logger.error(f"Ошибка извлечения аудио: {output}")
        
        return success
    
    def analyze_audio_to_notes(self, audio_path: Path) -> list:
        """
        Анализирует аудио и извлекает ноты с сохранением структуры мелодии
        
        Args:
            audio_path: Путь к аудио файлу
        
        Returns:
            list: Список нот (start_time, end_time, pitch, velocity)
        """
        try:
            # Загружаем аудио
            y, sr = librosa.load(str(audio_path), sr=self.config.sample_rate)
            
            # 1. АНАЛИЗ РИТМА И СТРУКТУРЫ
            # Находим темп
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beats, sr=sr)
            
            # Находим сильные доли (downbeats)
            onset_frames = librosa.onset.onset_detect(y=y, sr=sr, units='frames', 
                                                    pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.2, wait=10)
            onset_times = librosa.frames_to_time(onset_frames, sr=sr)
            
            # 2. АНАЛИЗ МЕЛОДИИ
            # Извлекаем основные частоты с адаптивным порогом
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr, threshold=0.1)
            
            # Анализируем гармонический контент для понимания тональности
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            chroma_times = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=sr)
            
            # Находим основную тональность
            key_profile = np.mean(chroma, axis=1)
            main_key = np.argmax(key_profile)
            
            notes = []
            
            # 3. ИЗВЛЕЧЕНИЕ МЕЛОДИЧЕСКОЙ ЛИНИИ
            # Анализируем каждый onset с учетом ритмической структуры
            for i, onset_time in enumerate(onset_times):
                onset_frame = onset_frames[i]
                
                # Определяем силу этого onset'а относительно ритма
                beat_distance = min([abs(onset_time - beat) for beat in beat_times])
                is_on_beat = beat_distance < 0.1  # В пределах 100ms от доли
                
                # Получаем питч для этого кадра
                pitch_values = pitches[:, onset_frame]
                magnitude_values = magnitudes[:, onset_frame]
                
                # Находим доминирующую частоту
                max_magnitude_idx = np.argmax(magnitude_values)
                pitch_hz = pitch_values[max_magnitude_idx]
                magnitude = magnitude_values[max_magnitude_idx]
                
                # Адаптивный порог в зависимости от ритма
                threshold = 0.2 if is_on_beat else 0.4
                
                if pitch_hz > 0 and magnitude > threshold:
                    # Конвертируем Hz в MIDI note
                    midi_note = int(12 * np.log2(pitch_hz / 440.0) + 69)
                    
                    # Ограничиваем диапазон пианино
                    if 48 <= midi_note <= 84:  # С3 до C6
                        # Вычисляем длительность ноты с учетом ритма
                        if i < len(onset_times) - 1:
                            next_onset = onset_times[i + 1]
                            duration = next_onset - onset_time
                            
                            # Корректируем длительность для ритмической точности
                            if is_on_beat:
                                # Ноты на долях могут быть длиннее
                                duration = min(duration * 1.2, 1.5)
                            else:
                                # Ноты между долями короче
                                duration = min(duration * 0.8, 0.8)
                        else:
                            duration = 0.5
                        
                        # Ограничиваем длительность
                        duration = max(0.1, min(duration, 2.0))
                        
                        # Вычисляем velocity с учетом ритма
                        base_velocity = int(magnitude * 127)
                        if is_on_beat:
                            # Ноты на долях громче
                            velocity = min(base_velocity * 1.2, 127)
                        else:
                            velocity = max(base_velocity * 0.8, 20)
                        
                        velocity = max(min(velocity, 127), 20)
                        
                        notes.append({
                            'start': onset_time,
                            'end': onset_time + duration,
                            'pitch': midi_note,
                            'velocity': velocity,
                            'is_on_beat': is_on_beat
                        })
            
            # 4. ДОБАВЛЯЕМ БАСОВУЮ ЛИНИЮ (только на сильные доли)
            bass_notes = self.add_bass_line_rhythmic(chroma, chroma_times, beat_times)
            notes.extend(bass_notes)
            
            # 5. СОРТИРУЕМ И ФИЛЬТРУЕМ НОТЫ
            notes.sort(key=lambda x: x['start'])
            
            # Удаляем слишком близкие ноты (дубликаты)
            filtered_notes = []
            for note in notes:
                if not filtered_notes or note['start'] - filtered_notes[-1]['start'] > 0.05:
                    filtered_notes.append(note)
            
            self.logger.info(f"Найдено {len(filtered_notes)} нот с сохранением ритмической структуры")
            return filtered_notes
            
        except Exception as e:
            self.logger.error(f"Ошибка анализа аудио: {e}")
            return []
    
    def detect_chords(self, chroma: np.ndarray, chroma_times: np.ndarray) -> list:
        """
        Определяет аккорды на основе хроматического анализа
        
        Args:
            chroma: Хроматические признаки
            chroma_times: Временные метки
        
        Returns:
            list: Список аккордов
        """
        chords = []
        
        # Простые мажорные и минорные аккорды
        major_chords = {
            'C': [0, 4, 7],   # C-E-G
            'D': [2, 6, 9],   # D-F#-A
            'E': [4, 8, 11],  # E-G#-B
            'F': [5, 9, 0],   # F-A-C
            'G': [7, 11, 2],  # G-B-D
            'A': [9, 1, 4],   # A-C#-E
            'B': [11, 3, 6]   # B-D#-F#
        }
        
        minor_chords = {
            'Cm': [0, 3, 7],  # C-Eb-G
            'Dm': [2, 5, 9],  # D-F-A
            'Em': [4, 7, 11], # E-G-B
            'Fm': [5, 8, 0],  # F-Ab-C
            'Gm': [7, 10, 2], # G-Bb-D
            'Am': [9, 0, 4],  # A-C-E
            'Bm': [11, 2, 6]  # B-D-F#
        }
        
        # Анализируем каждый временной кадр
        for i in range(chroma.shape[1]):
            chroma_vector = chroma[:, i]
            
            # Находим наиболее активные ноты
            active_notes = np.where(chroma_vector > 0.3)[0]
            
            if len(active_notes) >= 3:
                # Проверяем соответствие аккордам
                for chord_name, chord_notes in {**major_chords, **minor_chords}.items():
                    if all(note in active_notes for note in chord_notes):
                        chords.append({
                            'time': chroma_times[i],
                            'chord': chord_name,
                            'notes': chord_notes
                        })
                        break
        
        return chords
    
    def add_bass_line_rhythmic(self, chroma: np.ndarray, chroma_times: np.ndarray, beat_times: np.ndarray) -> list:
        """
        Добавляет ритмическую басовую линию на основе сильных долей
        
        Args:
            chroma: Хроматические признаки
            chroma_times: Временные метки для хроматических признаков
            beat_times: Времена сильных долей
        
        Returns:
            list: Список басовых нот
        """
        bass_notes = []
        
        # Добавляем басовые ноты только на сильные доли (каждую 2-ю или 4-ю)
        for i in range(0, len(beat_times), 2):  # Каждая 2-я доля
            beat_time = beat_times[i]
            
            # Находим ближайший хроматический кадр
            chroma_idx = np.argmin(np.abs(chroma_times - beat_time))
            chroma_vector = chroma[:, chroma_idx]
            
            # Находим доминирующую ноту в басовом диапазоне
            bass_strengths = []
            for note_class in range(12):  # Все ноты октавы
                strength = chroma_vector[note_class]
                bass_strengths.append((note_class, strength))
            
            # Сортируем по силе
            bass_strengths.sort(key=lambda x: x[1], reverse=True)
            
            # Берем самую сильную ноту, если она достаточно сильная
            if bass_strengths[0][1] > 0.3:
                note_class = bass_strengths[0][0]
                # Конвертируем в MIDI ноту в басовом диапазоне
                midi_note = note_class + 36  # C2 = 36
                
                # Ограничиваем басовый диапазон
                if 36 <= midi_note <= 60:  # C2 до C4
                    duration = 0.8  # Басовые ноты длиннее
                    velocity = 50   # Тише основной мелодии
                    
                    bass_notes.append({
                        'start': beat_time,
                        'end': beat_time + duration,
                        'pitch': midi_note,
                        'velocity': velocity
                    })
        
        return bass_notes
    
    def create_midi_from_notes(self, notes: list, output_path: Path) -> bool:
        """
        Создает MIDI файл из списка нот с разделением на треки
        
        Args:
            notes: Список нот
            output_path: Путь для сохранения MIDI
        
        Returns:
            bool: True если успешно
        """
        try:
            # Создаем MIDI объект
            midi = pretty_midi.PrettyMIDI()
            
            # Создаем один инструмент для всех нот (как в оригинальном Piano Hero)
            piano_track = pretty_midi.Instrument(program=0)  # Acoustic Grand Piano
            
            # Добавляем все ноты в один трек
            for note_data in notes:
                note = pretty_midi.Note(
                    velocity=note_data['velocity'],
                    pitch=note_data['pitch'],
                    start=note_data['start'],
                    end=note_data['end']
                )
                piano_track.notes.append(note)
            
            # Добавляем инструмент в MIDI
            if piano_track.notes:
                midi.instruments.append(piano_track)
            
            # Сохраняем MIDI файл
            midi.write(str(output_path))
            
            self.logger.info(f"MIDI файл создан: {output_path}")
            self.logger.info(f"  Всего нот: {len(piano_track.notes)}")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка создания MIDI: {e}")
            return False
    
    def convert_audio_to_midi(self, audio_path: Path, output_path: Path) -> bool:
        """
        Конвертирует аудио в MIDI
        
        Args:
            audio_path: Путь к аудио файлу
            output_path: Путь для сохранения MIDI
        
        Returns:
            bool: True если успешно
        """
        # Анализируем аудио
        notes = self.analyze_audio_to_notes(audio_path)
        
        if not notes:
            self.logger.error("Не удалось извлечь ноты из аудио")
            return False
        
        # Создаем MIDI файл
        return self.create_midi_from_notes(notes, output_path)
    
    def process_video_to_midi(self, video_path: Path, work_dir: Path) -> Optional[Path]:
        """
        Полный процесс: видео -> аудио -> MIDI
        
        Args:
            video_path: Путь к видео файлу
            work_dir: Рабочая директория
        
        Returns:
            Optional[Path]: Путь к созданному MIDI файлу или None
        """
        # Создаем пути для временных файлов
        audio_path = work_dir / "audio.mp3"
        midi_path = work_dir / "melody.mid"
        
        # Шаг 1: Извлекаем аудио
        if not self.extract_audio_from_video(video_path, audio_path):
            return None
        
        # Шаг 2: Конвертируем аудио в MIDI
        if not self.convert_audio_to_midi(audio_path, midi_path):
            return None
        
        self.logger.info(f"Успешно создан MIDI файл: {midi_path}")
        return midi_path
