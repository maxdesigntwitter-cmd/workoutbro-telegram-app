"""
Модуль для конвертации аудио в MIDI с использованием Basic Pitch
"""
import os
import logging
from pathlib import Path
from typing import Optional, List
import numpy as np
import basic_pitch
from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict_and_save


class AudioToMidiConverter:
    """Класс для конвертации аудио в MIDI"""
    
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
        from .utils import run_command
        
        command = [
            'ffmpeg', '-y',
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
    
    def convert_audio_to_midi(self, audio_path: Path, output_dir: Path) -> Optional[Path]:
        """
        Конвертирует аудио в MIDI используя Basic Pitch
        
        Args:
            audio_path: Путь к аудио файлу
            output_dir: Директория для сохранения MIDI
        
        Returns:
            Optional[Path]: Путь к созданному MIDI файлу или None
        """
        try:
            self.logger.info(f"Начинается конвертация аудио в MIDI: {audio_path}")
            
            # Создаем директорию если не существует
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Конвертируем аудио в MIDI
            predict_and_save(
                [str(audio_path)],
                output_dir,
                save_midi=True,
                sonify_midi=False,
                save_model_outputs=False,
                save_notes=False,
                model_path=ICASSP_2022_MODEL_PATH
            )
            
            # Ищем созданные MIDI файлы
            midi_files = list(output_dir.glob("*.mid"))
            
            if not midi_files:
                self.logger.error("MIDI файлы не созданы")
                return None
            
            # Выбираем melody.mid если доступен, иначе первый найденный
            melody_midi = output_dir / "melody.mid"
            if melody_midi.exists():
                selected_midi = melody_midi
            else:
                selected_midi = midi_files[0]
            
            self.logger.info(f"MIDI файл создан: {selected_midi}")
            return selected_midi
            
        except Exception as e:
            self.logger.error(f"Ошибка конвертации аудио в MIDI: {e}")
            return None
    
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
        midi_dir = work_dir / "midi"
        
        # Шаг 1: Извлекаем аудио
        if not self.extract_audio_from_video(video_path, audio_path):
            return None
        
        # Шаг 2: Конвертируем аудио в MIDI
        midi_path = self.convert_audio_to_midi(audio_path, midi_dir)
        
        if midi_path:
            self.logger.info(f"Успешно создан MIDI файл: {midi_path}")
        else:
            self.logger.error("Не удалось создать MIDI файл")
        
        return midi_path
    
    def optimize_midi(self, midi_path: Path, output_path: Path) -> bool:
        """
        Оптимизирует MIDI файл (удаляет короткие ноты, объединяет соседние)
        
        Args:
            midi_path: Путь к исходному MIDI
            output_path: Путь для сохранения оптимизированного MIDI
        
        Returns:
            bool: True если успешно
        """
        try:
            import pretty_midi
            
            # Загружаем MIDI
            midi_data = pretty_midi.PrettyMIDI(str(midi_path))
            
            # Минимальная длительность ноты (в секундах)
            min_note_duration = 0.1
            
            # Обрабатываем каждый инструмент
            for instrument in midi_data.instruments:
                if instrument.is_drum:
                    continue
                
                # Фильтруем короткие ноты
                filtered_notes = []
                for note in instrument.notes:
                    if note.end - note.start >= min_note_duration:
                        filtered_notes.append(note)
                
                # Объединяем соседние ноты с одинаковой высотой
                if filtered_notes:
                    merged_notes = []
                    current_note = filtered_notes[0]
                    
                    for next_note in filtered_notes[1:]:
                        # Если ноты имеют одинаковую высоту и близки по времени
                        if (next_note.pitch == current_note.pitch and 
                            next_note.start - current_note.end <= 0.1):
                            # Объединяем ноты
                            current_note.end = next_note.end
                        else:
                            merged_notes.append(current_note)
                            current_note = next_note
                    
                    merged_notes.append(current_note)
                    instrument.notes = merged_notes
            
            # Сохраняем оптимизированный MIDI
            midi_data.write(str(output_path))
            self.logger.info(f"MIDI оптимизирован: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка оптимизации MIDI: {e}")
            return False



