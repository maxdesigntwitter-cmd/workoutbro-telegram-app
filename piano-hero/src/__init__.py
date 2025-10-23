"""
Piano Hero Cover - Автоматический генератор видео с фортепианной анимацией

Этот пакет содержит все модули для создания вертикальных видео 1080×1920
с падающими нотами и пианино-каверами на основе исходного видео.
"""

__version__ = "1.0.0"
__author__ = "Piano Hero Cover Team"
__description__ = "Автоматический генератор видео с фортепианной анимацией"

from .config import Config
from .utils import setup_logging, check_dependencies
from .audio_to_midi_simple import SimpleAudioToMidiConverter as AudioToMidiConverter
from .midi_to_audio_simple import SimpleMidiToAudioConverter as MidiToAudioConverter
from .visualize_midi import MidiVisualizer
from .postprocess import VideoPostProcessor

__all__ = [
    'Config',
    'setup_logging',
    'check_dependencies',
    'AudioToMidiConverter',
    'MidiToAudioConverter',
    'MidiVisualizer',
    'VideoPostProcessor'
]
