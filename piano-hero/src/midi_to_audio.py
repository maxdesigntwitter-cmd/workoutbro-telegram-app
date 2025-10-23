"""
Модуль для синтеза пианино-кавера из MIDI с использованием FluidSynth
"""
import logging
from pathlib import Path
from typing import Optional
from .utils import run_command


class MidiToAudioConverter:
    """Класс для синтеза аудио из MIDI"""
    
    def __init__(self, config, logger: Optional[logging.Logger] = None):
        self.config = config
        self.logger = logger or logging.getLogger(__name__)
    
    def synthesize_piano_audio(self, midi_path: Path, output_path: Path) -> bool:
        """
        Синтезирует пианино-кавер из MIDI файла
        
        Args:
            midi_path: Путь к MIDI файлу
            output_path: Путь для сохранения аудио
        
        Returns:
            bool: True если успешно
        """
        # Проверяем существование SoundFont файла
        soundfont_path = Path(self.config.soundfont_path)
        if not soundfont_path.exists():
            self.logger.error(f"SoundFont файл не найден: {soundfont_path}")
            return False
        
        # Команда FluidSynth для синтеза
        command = [
            self.config.fluidsynth_bin,
            '-ni',  # без интерактивного режима
            str(soundfont_path),
            str(midi_path),
            '-F', str(output_path),  # выходной файл
            '-r', str(self.config.sample_rate),  # частота дискретизации
            '-g', str(self.config.midi_gain)  # громкость
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Пианино-кавер создан: {output_path}")
        else:
            self.logger.error(f"Ошибка синтеза пианино-кавера: {output}")
        
        return success
    
    def convert_midi_to_wav(self, midi_path: Path, output_path: Path) -> bool:
        """
        Конвертирует MIDI в WAV с настройками для пианино
        
        Args:
            midi_path: Путь к MIDI файлу
            output_path: Путь для сохранения WAV
        
        Returns:
            bool: True если успешно
        """
        # Создаем директорию если не существует
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Используем FluidSynth для конвертации
        return self.synthesize_piano_audio(midi_path, output_path)
    
    def enhance_audio(self, input_path: Path, output_path: Path) -> bool:
        """
        Улучшает качество аудио (нормализация, компрессия)
        
        Args:
            input_path: Путь к исходному аудио
            output_path: Путь для сохранения улучшенного аудио
        
        Returns:
            bool: True если успешно
        """
        # Команда FFmpeg для улучшения аудио
        command = [
            'ffmpeg', '-y',
            '-i', str(input_path),
            '-af', 'loudnorm,acompressor=threshold=0.1:ratio=3:attack=5:release=50',
            '-ar', str(self.config.sample_rate),
            '-ac', '2',
            '-b:a', self.config.audio_bitrate,
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Аудио улучшено: {output_path}")
        else:
            self.logger.error(f"Ошибка улучшения аудио: {output}")
        
        return success
    
    def get_audio_duration(self, audio_path: Path) -> Optional[float]:
        """
        Получает длительность аудио файла
        
        Args:
            audio_path: Путь к аудио файлу
        
        Returns:
            Optional[float]: Длительность в секундах или None
        """
        command = [
            'ffprobe',
            '-v', 'quiet',
            '-show_entries', 'format=duration',
            '-of', 'csv=p=0',
            str(audio_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success and output.strip():
            try:
                return float(output.strip())
            except ValueError:
                self.logger.error(f"Не удалось распарсить длительность: {output}")
                return None
        else:
            self.logger.error(f"Не удалось получить длительность аудио: {output}")
            return None
    
    def trim_audio_to_duration(self, input_path: Path, output_path: Path, duration: float) -> bool:
        """
        Обрезает аудио до указанной длительности
        
        Args:
            input_path: Путь к исходному аудио
            output_path: Путь для сохранения обрезанного аудио
            duration: Длительность в секундах
        
        Returns:
            bool: True если успешно
        """
        command = [
            'ffmpeg', '-y',
            '-i', str(input_path),
            '-t', str(duration),
            '-c', 'copy',
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Аудио обрезано до {duration}с: {output_path}")
        else:
            self.logger.error(f"Ошибка обрезки аудио: {output}")
        
        return success
    
    def process_midi_to_final_audio(self, midi_path: Path, work_dir: Path, target_duration: Optional[float] = None) -> Optional[Path]:
        """
        Полный процесс: MIDI -> WAV -> улучшение -> финальный аудио
        
        Args:
            midi_path: Путь к MIDI файлу
            work_dir: Рабочая директория
            target_duration: Целевая длительность (если нужно обрезать)
        
        Returns:
            Optional[Path]: Путь к финальному аудио файлу или None
        """
        # Создаем пути для временных файлов
        raw_wav_path = work_dir / "piano_raw.wav"
        enhanced_wav_path = work_dir / "piano_enhanced.wav"
        final_wav_path = work_dir / "piano.wav"
        
        # Шаг 1: Синтезируем MIDI в WAV
        if not self.synthesize_piano_audio(midi_path, raw_wav_path):
            return None
        
        # Шаг 2: Улучшаем качество аудио
        if not self.enhance_audio(raw_wav_path, enhanced_wav_path):
            return None
        
        # Шаг 3: Обрезаем до целевой длительности если нужно
        if target_duration:
            if not self.trim_audio_to_duration(enhanced_wav_path, final_wav_path, target_duration):
                return None
        else:
            # Просто копируем улучшенный файл
            import shutil
            shutil.copy2(enhanced_wav_path, final_wav_path)
        
        self.logger.info(f"Финальный пианино-кавер создан: {final_wav_path}")
        return final_wav_path



