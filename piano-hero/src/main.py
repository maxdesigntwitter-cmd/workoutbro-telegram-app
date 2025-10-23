"""
Основной модуль Piano Hero Cover - CLI интерфейс
"""
import argparse
import sys
import logging
from pathlib import Path
from typing import List, Optional

from .config import Config
from .utils import setup_logging, check_dependencies, get_video_files, clean_work_directory, get_output_filename, format_duration, run_command
from .audio_to_midi_simple import SimpleAudioToMidiConverter as AudioToMidiConverter
from .midi_to_audio_simple import SimpleMidiToAudioConverter as MidiToAudioConverter
from .visualize_midi import MidiVisualizer
from .postprocess import VideoPostProcessor


class PianoHeroCover:
    """Основной класс для генерации Piano Hero Cover видео"""
    
    def __init__(self, config_path: str = "configs/settings.yaml"):
        self.config = Config(config_path)
        self.logger = setup_logging(self.config.get('log_level', 'INFO'))
        
        # Инициализируем компоненты
        self.audio_to_midi = AudioToMidiConverter(self.config, self.logger)
        self.midi_to_audio = MidiToAudioConverter(self.config, self.logger)
        self.visualizer = MidiVisualizer(self.config, self.logger)
        self.postprocessor = VideoPostProcessor(self.config, self.logger)
    
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
            '-i', str(video_path),
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
                self.logger.info(f"Длительность видео: {total_seconds:.2f}с")
                return total_seconds
        
        self.logger.error(f"Не удалось получить длительность видео из вывода: {output}")
        return None
    
    def check_requirements(self) -> bool:
        """Проверяет все требования для работы"""
        self.logger.info("Проверка требований...")
        
        # Создаем необходимые директории
        self.config.ensure_directories()
        
        # Проверяем зависимости
        if not check_dependencies(self.config, self.logger):
            self.logger.error("Не все зависимости установлены. Запустите скрипт установки.")
            return False
        
        # Проверяем тему MidiVisualizer
        theme_path = Path("configs/midivisualizer.theme.json")
        if not self.visualizer.create_custom_theme(theme_path):
            self.logger.error("Не удалось создать тему MidiVisualizer")
            return False
        
        self.logger.info("Все требования выполнены")
        return True
    
    def process_single_video(self, video_path: Path, output_path: Path, keep_workdir: bool = False) -> bool:
        """
        Обрабатывает одно видео
        
        Args:
            video_path: Путь к видео файлу
            output_path: Путь для сохранения результата
            keep_workdir: Сохранять ли рабочую директорию
        
        Returns:
            bool: True если успешно
        """
        self.logger.info(f"Обработка видео: {video_path}")
        
        # Создаем рабочую директорию для этого видео
        work_dir = Path(self.config.get('work_dir', './work')) / video_path.stem
        work_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Получаем длительность оригинального видео
            original_duration = self.get_video_duration(video_path)
            if not original_duration:
                self.logger.error("Не удалось получить длительность оригинального видео")
                return False
            
            self.logger.info(f"Длительность оригинального видео: {original_duration:.2f}с")
            
            # Шаг 1: Видео -> MIDI
            self.logger.info("Шаг 1: Извлечение аудио и конвертация в MIDI...")
            midi_path = self.audio_to_midi.process_video_to_midi(video_path, work_dir)
            if not midi_path:
                self.logger.error("Не удалось создать MIDI файл")
                return False
            
            # Шаг 2: MIDI -> Пианино-кавер
            self.logger.info("Шаг 2: Синтез пианино-кавера...")
            audio_path = self.midi_to_audio.process_midi_to_final_audio(midi_path, work_dir, target_duration=original_duration)
            if not audio_path:
                self.logger.error("Не удалось создать пианино-кавер")
                return False
            
            # Шаг 3: MIDI -> Визуализация
            self.logger.info("Шаг 3: Создание визуализации...")
            theme_path = Path("configs/midivisualizer.theme.json")
            video_vis_path = self.visualizer.process_midi_to_visualization(midi_path, work_dir, theme_path)
            if not video_vis_path:
                self.logger.error("Не удалось создать визуализацию")
                return False
            
            # Шаг 4: Финальный монтаж
            self.logger.info("Шаг 4: Финальный монтаж...")
            success = self.postprocessor.create_final_video(
                video_vis_path, 
                audio_path, 
                output_path,
                add_metadata=True,
                optimize_mobile=False
            )
            
            if success:
                self.logger.info(f"✅ Видео успешно создано: {output_path}")
                # Очищаем рабочую директорию если не нужно сохранять
                if not keep_workdir:
                    clean_work_directory(work_dir, self.logger)
                return True
            else:
                self.logger.error("Не удалось создать финальное видео")
                return False
                
        except Exception as e:
            self.logger.error(f"Ошибка обработки видео {video_path}: {e}")
            return False
    
    def process_batch(self, input_dir: str, output_dir: str, keep_workdir: bool = False) -> dict:
        """
        Обрабатывает все видео в директории
        
        Args:
            input_dir: Директория с входными видео
            output_dir: Директория для выходных видео
            keep_workdir: Сохранять ли рабочие директории
        
        Returns:
            dict: Статистика обработки
        """
        self.logger.info(f"Пакетная обработка: {input_dir} -> {output_dir}")
        
        # Получаем список видео файлов
        video_files = get_video_files(input_dir)
        
        if not video_files:
            self.logger.warning(f"Видео файлы не найдены в {input_dir}")
            return {"total": 0, "success": 0, "failed": 0, "errors": []}
        
        self.logger.info(f"Найдено {len(video_files)} видео файлов")
        
        stats = {
            "total": len(video_files),
            "success": 0,
            "failed": 0,
            "errors": []
        }
        
        # Обрабатываем каждое видео
        for i, video_path in enumerate(video_files, 1):
            self.logger.info(f"Обработка {i}/{len(video_files)}: {video_path.name}")
            
            # Генерируем имя выходного файла
            output_path = get_output_filename(video_path, output_dir)
            
            # Обрабатываем видео
            success = self.process_video(video_path, output_path, keep_workdir)
            
            if success:
                stats["success"] += 1
            else:
                stats["failed"] += 1
                stats["errors"].append(str(video_path))
        
        # Выводим статистику
        self.logger.info(f"Пакетная обработка завершена:")
        self.logger.info(f"  Всего: {stats['total']}")
        self.logger.info(f"  Успешно: {stats['success']}")
        self.logger.info(f"  Ошибок: {stats['failed']}")
        
        if stats["errors"]:
            self.logger.error("Ошибки при обработке:")
            for error in stats["errors"]:
                self.logger.error(f"  - {error}")
        
        return stats


def main():
    """Основная функция CLI"""
    parser = argparse.ArgumentParser(
        description="Piano Hero Cover - Автоматический генератор видео с фортепианной анимацией",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Примеры использования:
  python -m src.main --input input/video.mp4
  python -m src.main --input input/ --output output/
  python -m src.main --input input/ --keep-workdir
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        required=True,
        help='Путь к входному видео файлу или директории'
    )
    
    parser.add_argument(
        '--output', '-o',
        help='Путь к выходной директории (по умолчанию: ./output)'
    )
    
    parser.add_argument(
        '--config', '-c',
        default='configs/settings.yaml',
        help='Путь к конфигурационному файлу'
    )
    
    parser.add_argument(
        '--keep-workdir',
        action='store_true',
        help='Сохранять рабочие директории для отладки'
    )
    
    parser.add_argument(
        '--fps',
        type=int,
        help='FPS для выходного видео (переопределяет настройки)'
    )
    
    parser.add_argument(
        '--theme',
        help='Путь к файлу темы MidiVisualizer'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Подробный вывод'
    )
    
    args = parser.parse_args()
    
    # Создаем экземпляр генератора
    try:
        generator = PianoHeroCover(args.config)
    except Exception as e:
        print(f"Ошибка загрузки конфигурации: {e}")
        sys.exit(1)
    
    # Настраиваем уровень логирования
    if args.verbose:
        generator.logger.setLevel(logging.DEBUG)
    
    # Переопределяем настройки из аргументов
    if args.fps:
        generator.config._config['fps'] = args.fps
    
    # Проверяем требования
    if not generator.check_requirements():
        sys.exit(1)
    
    # Определяем входной путь
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Ошибка: Путь не существует: {input_path}")
        sys.exit(1)
    
    # Определяем выходную директорию
    output_dir = args.output or generator.config.get('output_dir', './output')
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Обрабатываем в зависимости от типа входа
    if input_path.is_file():
        # Один файл
        output_file = get_output_filename(input_path, output_dir)
        success = generator.process_single_video(input_path, output_file, args.keep_workdir)
        
        if success:
            print(f"✅ Видео успешно создано: {output_file}")
            sys.exit(0)
        else:
            print("❌ Ошибка создания видео")
            sys.exit(1)
    
    elif input_path.is_dir():
        # Директория
        stats = generator.process_batch(str(input_path), output_dir, args.keep_workdir)
        
        if stats["failed"] == 0:
            print(f"✅ Все видео успешно обработаны ({stats['success']}/{stats['total']})")
            sys.exit(0)
        else:
            print(f"⚠️  Обработано {stats['success']}/{stats['total']} видео")
            sys.exit(1)
    
    else:
        print(f"Ошибка: Неизвестный тип пути: {input_path}")
        sys.exit(1)


if __name__ == "__main__":
    main()
