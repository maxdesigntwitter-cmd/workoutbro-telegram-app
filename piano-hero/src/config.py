"""
Конфигурационный модуль для Piano Hero Cover
"""
import yaml
import os
from pathlib import Path
from typing import Dict, Any


class Config:
    """Класс для управления конфигурацией проекта"""
    
    def __init__(self, config_path: str = "configs/settings.yaml"):
        self.config_path = config_path
        self._config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Загружает конфигурацию из YAML файла"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Конфигурационный файл не найден: {self.config_path}")
        except yaml.YAMLError as e:
            raise ValueError(f"Ошибка в конфигурационном файле: {e}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """Получает значение конфигурации по ключу"""
        return self._config.get(key, default)
    
    def get_path(self, key: str) -> Path:
        """Получает путь из конфигурации как Path объект"""
        path_str = self.get(key)
        if path_str:
            return Path(path_str)
        return None
    
    def ensure_directories(self):
        """Создает необходимые директории если они не существуют"""
        directories = [
            self.get('work_dir', './work'),
            self.get('input_dir', './input'),
            self.get('output_dir', './output'),
            self.get_path('soundfont_path').parent if self.get_path('soundfont_path') else None
        ]
        
        for directory in directories:
            if directory:
                Path(directory).mkdir(parents=True, exist_ok=True)
    
    @property
    def fps(self) -> int:
        return self.get('fps', 60)
    
    @property
    def target_width(self) -> int:
        return self.get('target_width', 1080)
    
    @property
    def target_height(self) -> int:
        return self.get('target_height', 1920)
    
    @property
    def audio_bitrate(self) -> str:
        return self.get('audio_bitrate', '256k')
    
    @property
    def sample_rate(self) -> int:
        return self.get('sample_rate', 44100)
    
    @property
    def midi_gain(self) -> float:
        return self.get('midi_gain', 0.9)
    
    @property
    def crf(self) -> int:
        return self.get('crf', 18)
    
    @property
    def preset(self) -> str:
        return self.get('preset', 'medium')
    
    @property
    def midivisualizer_bin(self) -> str:
        return self.get('midivisualizer_bin', './MidiVisualizer/midivisualizer')
    
    @property
    def fluidsynth_bin(self) -> str:
        return self.get('fluidsynth_bin', 'fluidsynth')
    
    @property
    def soundfont_path(self) -> str:
        return self.get('soundfont_path', './assets/piano.sf2')
    
    @property
    def render_melody_only(self) -> bool:
        return self.get('render_melody_only', True)
    
    @property
    def trim_to_audio(self) -> bool:
        return self.get('trim_to_audio', True)
    
    @property
    def base_render_width(self) -> int:
        return self.get('base_render_width', 1080)
    
    @property
    def base_render_height(self) -> int:
        return self.get('base_render_height', 1080)
