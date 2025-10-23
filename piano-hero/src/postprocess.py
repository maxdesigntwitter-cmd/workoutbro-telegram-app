"""
Модуль для финального монтажа видео и аудио
"""
import logging
from pathlib import Path
from typing import Optional
from .utils import run_command


class VideoPostProcessor:
    """Класс для финального монтажа видео"""
    
    def __init__(self, config, logger: Optional[logging.Logger] = None):
        self.config = config
        self.logger = logger or logging.getLogger(__name__)
    
    def combine_video_and_audio(self, video_path: Path, audio_path: Path, output_path: Path) -> bool:
        """
        Объединяет видео и аудио в финальный файл
        
        Args:
            video_path: Путь к видео файлу
            audio_path: Путь к аудио файлу
            output_path: Путь для сохранения финального видео
        
        Returns:
            bool: True если успешно
        """
        # Создаем директорию если не существует
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # FFmpeg команда для объединения видео и аудио
        command = [
            './ffmpeg', '-y',
            '-i', str(video_path),
            '-i', str(audio_path),
            '-map', '0:v:0',  # видео из первого файла
            '-map', '1:a:0',  # аудио из второго файла
            '-c:v', 'libx264',
            '-preset', self.config.preset,
            '-crf', str(self.config.crf),
            '-c:a', 'aac',
            '-b:a', self.config.audio_bitrate,
            '-shortest',  # обрезаем по самому короткому потоку
            '-r', str(self.config.fps),
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Финальное видео создано: {output_path}")
        else:
            self.logger.error(f"Ошибка создания финального видео: {output}")
        
        return success
    
    def get_media_duration(self, media_path: Path) -> Optional[float]:
        """
        Получает длительность медиа файла (видео или аудио)
        
        Args:
            media_path: Путь к медиа файлу
        
        Returns:
            Optional[float]: Длительность в секундах или None
        """
        command = [
            './ffmpeg',
            '-i', str(media_path),
            '-f', 'null',
            '-'
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if output:
            # Парсим вывод FFmpeg для поиска Duration
            import re
            duration_match = re.search(r'Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})', output)
            if duration_match:
                hours = int(duration_match.group(1))
                minutes = int(duration_match.group(2))
                seconds = float(duration_match.group(3))
                total_seconds = hours * 3600 + minutes * 60 + seconds
                return total_seconds
        
        self.logger.error(f"Не удалось получить длительность медиа из вывода: {output}")
        return None
    
    def synchronize_video_audio(self, video_path: Path, audio_path: Path, output_path: Path) -> bool:
        """
        Синхронизирует видео и аудио, обрезая по самому короткому
        
        Args:
            video_path: Путь к видео файлу
            audio_path: Путь к аудио файлу
            output_path: Путь для сохранения синхронизированного видео
        
        Returns:
            bool: True если успешно
        """
        # Получаем длительности
        video_duration = self.get_media_duration(video_path)
        audio_duration = self.get_media_duration(audio_path)
        
        if not video_duration or not audio_duration:
            self.logger.error("Не удалось получить длительности медиа файлов")
            return False
        
        self.logger.info(f"Длительность видео: {video_duration:.2f}с")
        self.logger.info(f"Длительность аудио: {audio_duration:.2f}с")
        
        # Определяем целевую длительность (самая короткая)
        target_duration = min(video_duration, audio_duration)
        
        # Создаем временные обрезанные файлы
        temp_video = video_path.parent / f"temp_video_{video_path.name}"
        temp_audio = audio_path.parent / f"temp_audio_{audio_path.name}"
        
        try:
            # Обрезаем видео
            if not self.trim_media(video_path, temp_video, target_duration):
                return False
            
            # Обрезаем аудио
            if not self.trim_media(audio_path, temp_audio, target_duration):
                return False
            
            # Объединяем обрезанные файлы
            success = self.combine_video_and_audio(temp_video, temp_audio, output_path)
            
            return success
            
        finally:
            # Удаляем временные файлы
            for temp_file in [temp_video, temp_audio]:
                if temp_file.exists():
                    temp_file.unlink()
    
    def trim_media(self, input_path: Path, output_path: Path, duration: float) -> bool:
        """
        Обрезает медиа файл до указанной длительности
        
        Args:
            input_path: Путь к исходному медиа файлу
            output_path: Путь для сохранения обрезанного файла
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
            self.logger.info(f"Медиа обрезано до {duration}с: {output_path}")
        else:
            self.logger.error(f"Ошибка обрезки медиа: {output}")
        
        return success
    
    def add_metadata(self, input_path: Path, output_path: Path, title: str = None) -> bool:
        """
        Добавляет метаданные к видео файлу
        
        Args:
            input_path: Путь к исходному видео
            output_path: Путь для сохранения видео с метаданными
            title: Заголовок видео
        
        Returns:
            bool: True если успешно
        """
        command = [
            './ffmpeg', '-y',
            '-i', str(input_path),
            '-c', 'copy',
            '-metadata', f'title={title or "Piano Hero Cover"}',
            '-metadata', 'artist=Piano Hero Cover Generator',
            '-metadata', 'description=Automatically generated piano cover with falling notes visualization',
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Метаданные добавлены: {output_path}")
        else:
            self.logger.error(f"Ошибка добавления метаданных: {output}")
        
        return success
    
    def optimize_for_mobile(self, input_path: Path, output_path: Path) -> bool:
        """
        Оптимизирует видео для мобильных устройств
        
        Args:
            input_path: Путь к исходному видео
            output_path: Путь для сохранения оптимизированного видео
        
        Returns:
            bool: True если успешно
        """
        command = [
            './ffmpeg', '-y',
            '-i', str(input_path),
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-maxrate', '2M',
            '-bufsize', '4M',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Видео оптимизировано для мобильных: {output_path}")
        else:
            self.logger.error(f"Ошибка оптимизации для мобильных: {output}")
        
        return success
    
    def create_final_video(self, video_path: Path, audio_path: Path, output_path: Path, 
                          add_metadata: bool = True, optimize_mobile: bool = False) -> bool:
        """
        Создает финальное видео с полной обработкой
        
        Args:
            video_path: Путь к видео файлу
            audio_path: Путь к аудио файлу
            output_path: Путь для сохранения финального видео
            add_metadata: Добавлять ли метаданные
            optimize_mobile: Оптимизировать ли для мобильных
        
        Returns:
            bool: True если успешно
        """
        # Создаем временные файлы
        temp_combined = output_path.parent / f"temp_combined_{output_path.name}"
        temp_with_metadata = output_path.parent / f"temp_metadata_{output_path.name}"
        
        try:
            # Шаг 1: Синхронизируем и объединяем видео и аудио
            if not self.synchronize_video_audio(video_path, audio_path, temp_combined):
                return False
            
            current_path = temp_combined
            
            # Шаг 2: Добавляем метаданные если нужно
            if add_metadata:
                if not self.add_metadata(current_path, temp_with_metadata):
                    return False
                current_path = temp_with_metadata
            
            # Шаг 3: Оптимизируем для мобильных если нужно
            if optimize_mobile:
                if not self.optimize_for_mobile(current_path, output_path):
                    return False
            else:
                # Просто копируем финальный файл
                import shutil
                shutil.copy2(current_path, output_path)
            
            self.logger.info(f"Финальное видео создано: {output_path}")
            return True
            
        finally:
            # Удаляем временные файлы
            for temp_file in [temp_combined, temp_with_metadata]:
                if temp_file.exists():
                    temp_file.unlink()
