"""
Упрощенный модуль для синтеза пианино-кавера из MIDI (без FluidSynth)
Использует FFmpeg для создания простого тонального аудио
"""
import logging
import numpy as np
from pathlib import Path
from typing import Optional
import pretty_midi
from .utils import run_command


class SimpleMidiToAudioConverter:
    """Упрощенный класс для синтеза аудио из MIDI"""
    
    def __init__(self, config, logger: Optional[logging.Logger] = None):
        self.config = config
        self.logger = logger or logging.getLogger(__name__)
    
    def midi_note_to_frequency(self, midi_note: int) -> float:
        """Конвертирует MIDI ноту в частоту"""
        return 440.0 * (2 ** ((midi_note - 69) / 12.0))
    
    def create_tone_audio(self, frequency: float, duration: float, sample_rate: int = 44100, note_type: str = "melody") -> np.ndarray:
        """
        Создает максимально реалистичный звук пианино с продвинутым физическим моделированием
        
        Args:
            frequency: Частота в Hz
            duration: Длительность в секундах
            sample_rate: Частота дискретизации
            note_type: Тип ноты (melody, chord, bass)
        
        Returns:
            np.ndarray: Аудио сигнал
        """
        if duration <= 0:
            return np.array([])
        
        # Количество сэмплов
        num_samples = int(duration * sample_rate)
        if num_samples <= 0:
            return np.array([])
        
        # Временная ось
        t = np.linspace(0, duration, num_samples, dtype=np.float32)
        
        # 1. МОДЕЛИРОВАНИЕ УДАРА МОЛОТКА (Hammer Attack)
        # Более реалистичный удар молоточка с несколькими компонентами
        hammer_attack_1 = np.exp(-t * 80) * np.sin(2 * np.pi * frequency * t * 3) * 0.4
        hammer_attack_2 = np.exp(-t * 120) * np.sin(2 * np.pi * frequency * t * 5) * 0.2
        hammer_attack = hammer_attack_1 + hammer_attack_2
        
        # 2. ОСНОВНОЙ ТОН С РЕАЛИСТИЧНЫМИ ГАРМОНИКАМИ
        # Основной тон с легким вибрато
        fundamental_vibrato = 0.5  # Hz
        fundamental = np.sin(2 * np.pi * frequency * t * (1 + 0.001 * np.sin(2 * np.pi * fundamental_vibrato * t)))
        
        # Реалистичные гармоники пианино (на основе анализа настоящих пианино)
        harmonics = [
            (2, 0.7, 0.0003),    # Октава с легким расстройом
            (3, 0.5, 0.0005),    # Квинта
            (4, 0.35, 0.0007),   # Двойная октава
            (5, 0.25, 0.0009),   # Большая терция
            (6, 0.18, 0.0011),   # Квинта + октава
            (7, 0.12, 0.0013),   # Малая септима
            (8, 0.08, 0.0015),   # Тройная октава
            (9, 0.05, 0.0017),   # Девятая гармоника
            (10, 0.03, 0.0019),  # Десятая гармоника
        ]
        
        main_tone = fundamental
        for harmonic_freq, amplitude, detune in harmonics:
            # Добавляем небольшое расстройство для реализма
            detuned_freq = frequency * harmonic_freq * (1 + detune)
            harmonic = np.sin(2 * np.pi * detuned_freq * t) * amplitude
            main_tone += harmonic
        
        # 3. НЕГАРМОНИЧЕСКИЕ ОБЕРТОНЫ (Inharmonicity)
        # Пианино имеет характерные расстроенные обертоны
        inharmonic_factors = [1.0002, 1.0004, 1.0006, 1.0008]
        inharmonic_tone = np.zeros_like(t)
        for i, factor in enumerate(inharmonic_factors):
            inharmonic = np.sin(2 * np.pi * frequency * factor * t) * (0.08 - i * 0.02)
            inharmonic_tone += inharmonic
        
        # 4. РЕЗОНАНС СТРУН И ДЕКИ (String and Soundboard Resonance)
        # Дополнительные частоты от резонанса соседних струн и деки
        resonance_freqs = [
            frequency * 0.5,   # Субгармоника
            frequency * 1.5,   # Полтора тона
            frequency * 2.5,   # Два с половиной тона
            frequency * 3.5,   # Три с половиной тона
        ]
        resonance_tone = np.zeros_like(t)
        for i, res_freq in enumerate(resonance_freqs):
            resonance = np.sin(2 * np.pi * res_freq * t) * (0.06 - i * 0.01)
            resonance_tone += resonance
        
        # 5. МОДЕЛИРОВАНИЕ ДЕКИ (Soundboard Modeling)
        # Дека пианино добавляет свои резонансы
        soundboard_freqs = [frequency * 0.25, frequency * 0.75, frequency * 1.25]
        soundboard_tone = np.zeros_like(t)
        for sbf in soundboard_freqs:
            soundboard = np.sin(2 * np.pi * sbf * t) * 0.04
            soundboard_tone += soundboard
        
        # 6. КОМБИНИРУЕМ ВСЕ КОМПОНЕНТЫ
        tone = hammer_attack + main_tone + inharmonic_tone + resonance_tone + soundboard_tone
        
        # 7. РЕАЛИСТИЧНАЯ ADSR ОГИБАЮЩАЯ
        if duration < 0.1:
            # Для очень коротких нот
            attack_time = 0.003
            decay_time = 0.008
            sustain_level = 0.15
            release_time = duration - attack_time - decay_time
            release_time = max(0.003, release_time)
        else:
            # Стандартная огибающая пианино
            attack_time = 0.005    # Очень быстрая атака (молоток)
            decay_time = 0.08      # Быстрый спад
            sustain_level = 0.25   # Низкий сустейн (струны затухают)
            release_time = duration - attack_time - decay_time
            release_time = max(0.1, release_time)
        
        # Создаем огибающую
        envelope = np.zeros_like(tone)
        
        # Attack фаза (экспоненциальная с небольшим overshoot)
        attack_samples = int(attack_time * sample_rate)
        if attack_samples > 0:
            attack_curve = 1 - np.exp(-t[:attack_samples] * 300)
            # Добавляем небольшой overshoot для реализма
            overshoot = 0.1 * np.exp(-t[:attack_samples] * 500)
            envelope[:attack_samples] = attack_curve + overshoot
        
        # Decay фаза (экспоненциальная)
        decay_samples = int(decay_time * sample_rate)
        if decay_samples > 0:
            decay_start = attack_samples
            decay_end = decay_start + decay_samples
            if decay_end <= len(envelope):
                decay_t = t[decay_start:decay_end] - t[decay_start]
                envelope[decay_start:decay_end] = sustain_level + (1.1 - sustain_level) * np.exp(-decay_t * 25)
        
        # Sustain фаза
        sustain_start = attack_samples + decay_samples
        sustain_end = len(envelope) - int(release_time * sample_rate)
        if sustain_start < sustain_end:
            envelope[sustain_start:sustain_end] = sustain_level
        
        # Release фаза (экспоненциальная)
        release_samples = int(release_time * sample_rate)
        if release_samples > 0:
            release_start = len(envelope) - release_samples
            if release_start >= 0:
                release_t = t[release_start:] - t[release_start]
                envelope[release_start:] = sustain_level * np.exp(-release_t * 15)
        
        # 8. ПРИМЕНЯЕМ ОГИБАЮЩУЮ
        tone = tone * envelope
        
        # 9. ДОБАВЛЯЕМ РЕАЛИСТИЧНЫЙ ШУМ МОЛОТОЧКА
        # Шум молоточка более выражен в начале
        hammer_noise = np.random.normal(0, 0.02, len(tone))
        noise_envelope = np.exp(-t * 100)  # Шум быстро затухает
        tone += hammer_noise * noise_envelope
        
        # 10. ДОБАВЛЯЕМ ШУМ СТРУН
        # Легкий шум от вибрации струн
        string_noise = np.random.normal(0, 0.005, len(tone))
        string_noise_envelope = np.exp(-t * 20)  # Шум струн затухает медленнее
        tone += string_noise * string_noise_envelope
        
        # 11. ПРОСТАЯ РЕВЕРБЕРАЦИЯ (Echo)
        # Добавляем несколько задержанных копий для пространственности
        delays = [0.05, 0.1, 0.15]  # 50ms, 100ms, 150ms
        for delay in delays:
            delay_samples = int(delay * sample_rate)
            if delay_samples < len(tone):
                delayed = np.zeros_like(tone)
                delayed[delay_samples:] = tone[:-delay_samples] * (0.3 / len(delays))
                tone += delayed
        
        # 12. ФИНАЛЬНАЯ ОБРАБОТКА
        # Легкое сжатие для реализма
        tone = np.tanh(tone * 1.2) * 0.8
        
        # Нормализуем
        if np.max(np.abs(tone)) > 0:
            tone = tone / np.max(np.abs(tone)) * 0.85
        
        return tone.astype(np.float32)
    
    def create_karplus_strong_tone(self, frequency: float, duration: float, sample_rate: int = 44100) -> np.ndarray:
        """
        Создает тон с использованием алгоритма Karplus-Strong для более реалистичного звука струн
        """
        # Длина линии задержки (минимум 1)
        delay_length = max(1, int(sample_rate / frequency))
        
        # Создаем массив для результата
        output_length = int(duration * sample_rate)
        output = np.zeros(output_length)
        
        # Инициализируем линию задержки белым шумом
        delay_line = np.random.uniform(-1, 1, delay_length)
        
        # Параметры фильтра
        feedback = 0.995  # Обратная связь (затухание)
        lowpass_factor = 0.5  # Фактор низкочастотного фильтра
        
        # Генерируем звук
        for i in range(output_length):
            if i < delay_length:
                # В начале используем шум
                output[i] = delay_line[i]
            else:
                # Применяем алгоритм Karplus-Strong
                # Берем значение из конца линии задержки
                delayed_sample = delay_line[-1]
                
                # Применяем низкочастотный фильтр (усреднение с предыдущим сэмплом)
                if delay_length > 1:
                    filtered_sample = lowpass_factor * delayed_sample + (1 - lowpass_factor) * delay_line[-2]
                else:
                    filtered_sample = delayed_sample
                
                # Добавляем обратную связь
                output[i] = filtered_sample * feedback
                
                # Сдвигаем линию задержки
                delay_line = np.roll(delay_line, -1)
                delay_line[-1] = output[i]
        
        # Применяем огибающую для более реалистичного звука
        if len(output) > 0:
            envelope = np.exp(-np.linspace(0, 3, len(output)))
            output = output * envelope
        
        return output.astype(np.float32)
    
    def create_hybrid_tone(self, frequency: float, duration: float, sample_rate: int = 44100) -> np.ndarray:
        """
        Создает гибридный тон, комбинируя несколько методов синтеза
        """
        # Создаем тон с улучшенным алгоритмом
        improved_tone = self.create_tone_audio(frequency, duration, sample_rate)
        
        # Создаем тон с Karplus-Strong
        ks_tone = self.create_karplus_strong_tone(frequency, duration, sample_rate)
        
        # Комбинируем тоны (70% улучшенный, 30% Karplus-Strong)
        hybrid_tone = 0.7 * improved_tone + 0.3 * ks_tone
        
        # Нормализуем
        if np.max(np.abs(hybrid_tone)) > 0:
            hybrid_tone = hybrid_tone / np.max(np.abs(hybrid_tone)) * 0.8
        
        return hybrid_tone.astype(np.float32)
    
    def synthesize_midi_to_audio(self, midi_path: Path, output_path: Path, target_duration: Optional[float] = None) -> bool:
        """
        Синтезирует аудио из MIDI файла
        
        Args:
            midi_path: Путь к MIDI файлу
            output_path: Путь для сохранения аудио
            target_duration: Целевая длительность (если нужно растянуть)
        
        Returns:
            bool: True если успешно
        """
        try:
            # Загружаем MIDI
            midi_data = pretty_midi.PrettyMIDI(str(midi_path))
            
            # Получаем общую длительность MIDI
            midi_duration = midi_data.get_end_time()
            sample_rate = self.config.sample_rate
            
            # Определяем целевую длительность
            # Используем длительность MIDI как основную, так как она более точная
            final_duration = midi_duration
            stretch_factor = 1.0
            self.logger.info(f"Используем длительность MIDI: {midi_duration:.2f}с")
            
            # Создаем массив для аудио с большим буфером для множественных нот
            audio_length = int(final_duration * sample_rate) + int(2.0 * sample_rate)  # +2 секунды буфера
            audio = np.zeros(audio_length, dtype=np.float32)
            
            # Обрабатываем каждый инструмент
            for instrument in midi_data.instruments:
                if instrument.is_drum:
                    continue
                
                # Обрабатываем каждую ноту
                for note_idx, note in enumerate(instrument.notes):
                    # Конвертируем MIDI ноту в частоту
                    frequency = self.midi_note_to_frequency(note.pitch)
                    
                    # Вычисляем длительность ноты (с учетом растяжения)
                    duration = (note.end - note.start) * stretch_factor
                    
                    # Пропускаем очень короткие ноты (меньше 0.01 секунды)
                    if duration < 0.01:
                        continue
                    
                    # Используем один тип нот для всех (как в оригинальном Piano Hero)
                    note_type = "melody"
                    
                    # Создаем тональный сигнал
                    tone = self.create_tone_audio(frequency, duration, sample_rate, note_type)
                    
                    # Вычисляем позицию в аудио массиве (с учетом растяжения)
                    start_sample = int(note.start * stretch_factor * sample_rate)
                    
                    
                    # Добавляем тон к аудио (с нормализацией velocity)
                    velocity_factor = note.velocity / 127.0
                    
                    # Проверяем границы и обрезаем тон если необходимо
                    if start_sample >= len(audio):
                        # Нота начинается после конца аудио
                        self.logger.warning(f"Нота начинается после конца аудио: start_sample={start_sample}, audio_length={len(audio)}")
                        continue
                    
                    # Определяем сколько сэмплов можно добавить
                    available_length = len(audio) - start_sample
                    tone_length = min(len(tone), available_length)
                    
                    if tone_length > 0 and start_sample >= 0:
                        try:
                            # Убеждаемся, что индексы корректны
                            end_sample = start_sample + tone_length
                            if end_sample <= len(audio):
                                audio[start_sample:end_sample] += tone[:tone_length] * velocity_factor
                            else:
                                self.logger.warning(f"Нота выходит за границы аудио: start={start_sample}, end={end_sample}, audio_len={len(audio)}")
                        except ValueError as e:
                            self.logger.error(f"Ошибка добавления тона: {e}")
                            self.logger.error(f"  start_sample={start_sample}, tone_length={tone_length}")
                            self.logger.error(f"  len(audio)={len(audio)}, len(tone)={len(tone)}")
                            self.logger.error(f"  available_length={available_length}")
                            # Пропускаем эту ноту вместо прерывания всего процесса
                            continue
            
            # Если нужно растянуть и есть пустое место в конце, добавляем тишину
            if target_duration and target_duration > midi_duration:
                # Добавляем тишину в конце
                silence_samples = int((target_duration - midi_duration) * sample_rate)
                if silence_samples > 0:
                    audio = np.pad(audio, (0, silence_samples), mode='constant')
            
            # Убеждаемся, что аудио имеет правильную длительность
            expected_length = int(final_duration * sample_rate)
            if len(audio) != expected_length:
                if len(audio) < expected_length:
                    # Добавляем тишину в конце
                    audio = np.pad(audio, (0, expected_length - len(audio)), mode='constant')
                else:
                    # Обрезаем лишнее
                    audio = audio[:expected_length]
            
            # Нормализуем аудио
            if np.max(np.abs(audio)) > 0:
                audio = audio / np.max(np.abs(audio)) * 0.8
            
            # Сохраняем как WAV файл
            import soundfile as sf
            sf.write(str(output_path), audio, sample_rate)
            
            self.logger.info(f"Аудио синтезировано: {output_path} (длительность: {final_duration:.2f}с)")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка синтеза аудио: {e}")
            return False
    
    def enhance_audio(self, input_path: Path, output_path: Path) -> bool:
        """
        Улучшает качество аудио с максимально реалистичными эффектами для настоящего звука пианино
        
        Args:
            input_path: Путь к исходному аудио
            output_path: Путь для сохранения улучшенного аудио
        
        Returns:
            bool: True если успешно
        """
        # Максимально реалистичная цепочка фильтров для пианино
        audio_filters = [
            # Нормализация громкости
            'loudnorm=I=-18:LRA=12:TP=-2',
            # Мягкая компрессия для пианино (более естественная)
            'acompressor=threshold=0.15:ratio=1.8:attack=5:release=50:makeup=2',
            # Эквалайзер для реалистичной частотной характеристики пианино
            'equalizer=f=60:width_type=h:width=40:g=4',     # Глубокие басы
            'equalizer=f=120:width_type=h:width=80:g=3',    # Низкие средние
            'equalizer=f=250:width_type=h:width=120:g=2.5', # Средние басы
            'equalizer=f=500:width_type=h:width=200:g=2',   # Средние частоты
            'equalizer=f=1000:width_type=h:width=400:g=1.5', # Высокие средние
            'equalizer=f=2000:width_type=h:width=600:g=1',   # Присутствие
            'equalizer=f=4000:width_type=h:width=800:g=0.8', # Яркость
            'equalizer=f=8000:width_type=h:width=1200:g=0.5', # Воздух
            # Многократное эхо для реалистичной реверберации
            'aecho=0.8:0.9:300:0.3',  # Первое эхо
            'aecho=0.6:0.7:600:0.2',  # Второе эхо
            'aecho=0.4:0.5:900:0.1',  # Третье эхо
            # Легкий хорус для богатства звука
            'chorus=0.4:0.6:60:0.4:0.3:1.2',
            # Легкое тремоло для живости
            'tremolo=f=5.5:d=0.08',
            # Добавляем легкий дисторшн для реализма
            'overdrive=gain=8:colour=0.2',
            # Финальная нормализация
            'loudnorm=I=-16:LRA=8:TP=-1.5'
        ]
        
        command = [
            './ffmpeg', '-y',
            '-i', str(input_path),
            '-af', ','.join(audio_filters),
            '-ar', str(self.config.sample_rate),
            '-ac', '2',
            '-b:a', '512k',  # Максимальный битрейт для лучшего качества
            str(output_path)
        ]
        
        success, output = run_command(command, logger=self.logger)
        
        if success:
            self.logger.info(f"Аудио улучшено с максимально реалистичными эффектами пианино: {output_path}")
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
            './ffmpeg',
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
        if not self.synthesize_midi_to_audio(midi_path, raw_wav_path, target_duration):
            return None
        
        # Шаг 2: Улучшаем качество аудио
        if not self.enhance_audio(raw_wav_path, enhanced_wav_path):
            return None
        
        # Шаг 3: Обрезаем до целевой длительности если нужно
        if target_duration:
            command = [
                './ffmpeg', '-y',
                '-i', str(enhanced_wav_path),
                '-t', str(target_duration),
                '-c', 'copy',
                str(final_wav_path)
            ]
            
            success, output = run_command(command, logger=self.logger)
            if not success:
                self.logger.error(f"Ошибка обрезки аудио: {output}")
                return None
        else:
            # Просто копируем улучшенный файл
            import shutil
            shutil.copy2(enhanced_wav_path, final_wav_path)
        
        self.logger.info(f"Финальный пианино-кавер создан: {final_wav_path}")
        return final_wav_path
