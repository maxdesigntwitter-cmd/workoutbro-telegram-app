"""
Утилиты для Piano Hero Cover
"""
import os
import subprocess
import logging
from pathlib import Path
from typing import List, Optional, Tuple


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Настраивает логирование"""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('piano_hero.log', encoding='utf-8')
        ]
    )
    return logging.getLogger(__name__)


def run_command(command: List[str], cwd: Optional[str] = None, logger: Optional[logging.Logger] = None) -> Tuple[bool, str]:
    """
    Выполняет команду и возвращает результат
    
    Args:
        command: Список аргументов команды
        cwd: Рабочая директория
        logger: Логгер для вывода информации
    
    Returns:
        Tuple[bool, str]: (успех, вывод команды)
    """
    if logger:
        logger.info(f"Выполняется команда: {' '.join(command)}")
    
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        
        if logger:
            logger.info(f"Команда выполнена успешно")
            if result.stdout:
                logger.debug(f"STDOUT: {result.stdout}")
            if result.stderr:
                logger.debug(f"STDERR: {result.stderr}")
        
        # Возвращаем и stdout и stderr
        output = result.stdout + result.stderr
        return True, output
        
    except subprocess.CalledProcessError as e:
        error_msg = f"Ошибка выполнения команды: {e.stderr}"
        if logger:
            logger.error(error_msg)
        return False, error_msg
    
    except FileNotFoundError:
        error_msg = f"Команда не найдена: {command[0]}"
        if logger:
            logger.error(error_msg)
        return False, error_msg


def check_dependencies(config, logger: Optional[logging.Logger] = None) -> bool:
    """
    Проверяет наличие необходимых зависимостей
    
    Args:
        config: Объект конфигурации
        logger: Логгер для вывода информации
    
    Returns:
        bool: True если все зависимости найдены
    """
    dependencies = [
        ('ffmpeg', [config.get('ffmpeg_bin', './ffmpeg'), '-version']),
        ('midivisualizer', [config.midivisualizer_bin, '--help'])
    ]
    
    all_found = True
    
    for name, command in dependencies:
        success, _ = run_command(command, logger=logger)
        if not success:
            if logger:
                logger.error(f"Зависимость не найдена: {name}")
            all_found = False
        else:
            if logger:
                logger.info(f"Зависимость найдена: {name}")
    
    # SoundFont не нужен для упрощенной версии
    
    return all_found


def get_video_files(input_dir: str) -> List[Path]:
    """
    Получает список видео файлов из директории
    
    Args:
        input_dir: Путь к директории с видео
    
    Returns:
        List[Path]: Список путей к видео файлам
    """
    input_path = Path(input_dir)
    if not input_path.exists():
        return []
    
    video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'}
    video_files = []
    
    for file_path in input_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in video_extensions:
            video_files.append(file_path)
    
    return sorted(video_files)


def clean_work_directory(work_dir: str, logger: Optional[logging.Logger] = None):
    """
    Очищает рабочую директорию
    
    Args:
        work_dir: Путь к рабочей директории
        logger: Логгер для вывода информации
    """
    work_path = Path(work_dir)
    if work_path.exists():
        for file_path in work_path.iterdir():
            if file_path.is_file():
                file_path.unlink()
                if logger:
                    logger.debug(f"Удален файл: {file_path}")
        if logger:
            logger.info(f"Рабочая директория очищена: {work_dir}")


def get_output_filename(input_file: Path, output_dir: str) -> Path:
    """
    Генерирует имя выходного файла
    
    Args:
        input_file: Путь к входному файлу
        output_dir: Директория для выходных файлов
    
    Returns:
        Path: Путь к выходному файлу
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    base_name = input_file.stem
    output_filename = f"{base_name}_piano_1080x1920.mp4"
    
    return output_path / output_filename


def format_duration(seconds: float) -> str:
    """
    Форматирует длительность в читаемый вид
    
    Args:
        seconds: Длительность в секундах
    
    Returns:
        str: Отформатированная строка
    """
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes:02d}:{seconds:02d}"
