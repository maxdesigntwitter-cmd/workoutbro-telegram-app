"""
Модуль для создания визуализации MIDI с падающими нотами
"""
import logging
from pathlib import Path
from typing import Optional
from .utils import run_command


class MidiVisualizer:
    """Класс для создания визуализации MIDI"""
    
    def __init__(self, config, logger: Optional[logging.Logger] = None):
        self.config = config
        self.logger = logger or logging.getLogger(__name__)
    
    def create_midi_visualization(self, midi_path: Path, output_path: Path, theme_path: Path) -> bool:
        """
        Создает визуализацию MIDI с падающими нотами
        
        Args:
            midi_path: Путь к MIDI файлу
            output_path: Путь для сохранения видео
            theme_path: Путь к файлу темы
        
        Returns:
            bool: True если успешно
        """
        # Проверяем существование MidiVisualizer
        midivisualizer_bin = Path(self.config.midivisualizer_bin)
        if not midivisualizer_bin.exists():
            self.logger.error(f"MidiVisualizer не найден: {midivisualizer_bin}")
            return False
        
        # Проверяем существование темы
        if not theme_path.exists():
            self.logger.error(f"Файл темы не найден: {theme_path}")
            return False
        
        # Команда MidiVisualizer
        command = [
            str(midivisualizer_bin),
            '--midi', str(midi_path),
            '--export', str(output_path),
            '--format', 'MPEG4',
            '--framerate', str(self.config.fps),
            '--hide-window', '1'
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Визуализация MIDI создана: {output_path}")
        else:
            self.logger.error(f"Ошибка создания визуализации MIDI: {output}")
        
        return success
    
    def scale_video_to_target_size(self, input_path: Path, output_path: Path) -> bool:
        """
        Масштабирует видео до целевого размера 1080x1920
        
        Args:
            input_path: Путь к исходному видео
            output_path: Путь для сохранения масштабированного видео
        
        Returns:
            bool: True если успешно
        """
        # FFmpeg команда для масштабирования и добавления черных полос
        command = [
            './ffmpeg', '-y',
            '-i', str(input_path),
            '-vf', f'scale={self.config.target_width}:{self.config.target_width}:force_original_aspect_ratio=decrease,pad={self.config.target_width}:{self.config.target_height}:0:420:black',
            '-c:v', 'libx264',
            '-preset', self.config.preset,
            '-crf', str(self.config.crf),
            '-r', str(self.config.fps),
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Видео масштабировано: {output_path}")
        else:
            self.logger.error(f"Ошибка масштабирования видео: {output}")
        
        return success
    
    def get_video_duration(self, video_path: Path) -> Optional[float]:
        """
        Получает длительность видео файла
        
        Args:
            video_path: Путь к видео файлу
        
        Returns:
            Optional[float]: Длительность в секундах или None
        """
        command = [
            './ffmpeg',
            '-v', 'quiet',
            '-show_entries', 'format=duration',
            '-of', 'csv=p=0',
            str(video_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success and output.strip():
            try:
                return float(output.strip())
            except ValueError:
                self.logger.error(f"Не удалось распарсить длительность: {output}")
                return None
        else:
            self.logger.error(f"Не удалось получить длительность видео: {output}")
            return None
    
    def trim_video_to_duration(self, input_path: Path, output_path: Path, duration: float) -> bool:
        """
        Обрезает видео до указанной длительности
        
        Args:
            input_path: Путь к исходному видео
            output_path: Путь для сохранения обрезанного видео
            duration: Длительность в секундах
        
        Returns:
            bool: True если успешно
        """
        command = [
            './ffmpeg', '-y',
            '-i', str(input_path),
            '-t', str(duration),
            '-c', 'copy',
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Видео обрезано до {duration}с: {output_path}")
        else:
            self.logger.error(f"Ошибка обрезки видео: {output}")
        
        return success
    
    def process_midi_to_visualization(self, midi_path: Path, work_dir: Path, theme_path: Path, target_duration: Optional[float] = None) -> Optional[Path]:
        """
        Полный процесс: MIDI -> визуализация -> масштабирование -> финальное видео
        
        Args:
            midi_path: Путь к MIDI файлу
            work_dir: Рабочая директория
            theme_path: Путь к файлу темы
            target_duration: Целевая длительность (если нужно обрезать)
        
        Returns:
            Optional[Path]: Путь к финальному видео файлу или None
        """
        # Создаем пути для временных файлов
        raw_video_path = work_dir / "visual.mp4"
        scaled_video_path = work_dir / "visual_1080x1920.mp4"
        final_video_path = work_dir / "visual_final.mp4"
        
        # Шаг 1: Создаем визуализацию MIDI
        if not self.create_midi_visualization(midi_path, raw_video_path, theme_path):
            return None
        
        # Шаг 2: Масштабируем до целевого размера
        if not self.scale_video_to_target_size(raw_video_path, scaled_video_path):
            return None
        
        # Шаг 3: Обрезаем до целевой длительности если нужно
        if target_duration:
            if not self.trim_video_to_duration(scaled_video_path, final_video_path, target_duration):
                return None
        else:
            # Просто копируем масштабированное видео
            import shutil
            shutil.copy2(scaled_video_path, final_video_path)
        
        self.logger.info(f"Финальная визуализация создана: {final_video_path}")
        return final_video_path
    
    def create_custom_theme(self, theme_path: Path) -> bool:
        """
        Создает кастомную тему для MidiVisualizer если не существует
        
        Args:
            theme_path: Путь к файлу темы
        
        Returns:
            bool: True если успешно
        """
        if theme_path.exists():
            self.logger.info(f"Тема уже существует: {theme_path}")
            return True
        
        # Создаем директорию если не существует
        theme_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Создаем тему по умолчанию
        default_theme = {
            "keyboard": {
                "drawKeys": True,
                "drawKeyLabels": False,
                "height": 180
            },
            "theme": {
                "backgroundColor": "#0B0B0B",
                "noteColor": "#FFD447",
                "highlightColor": "#FFE37A",
                "whiteKeyColor": "#FFFFFF",
                "blackKeyColor": "#111111"
            },
            "render": {
                "cameraMode": "top",
                "showShadows": True,
                "noteOpacity": 1.0,
                "noteHeight": 18.0,
                "fallingNotes": True
            }
        }
        
        try:
            import json
            with open(theme_path, 'w', encoding='utf-8') as f:
                json.dump(default_theme, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Создана тема по умолчанию: {theme_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка создания темы: {e}")
            return False
