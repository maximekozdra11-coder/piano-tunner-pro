"""
BeatAnalyzer - Analyse des battements avec transformée de Hilbert
"""
import numpy as np
from scipy.signal import hilbert, butter, filtfilt


class BeatAnalyzer:
    """
    Analyse les battements en filtrant autour d'un partiel et en utilisant
    la transformée de Hilbert pour extraire l'enveloppe.
    """
    
    def __init__(self, sample_rate=44100):
        """
        Initialise l'analyseur de battements.
        
        Args:
            sample_rate (int): Fréquence d'échantillonnage
        """
        self.sample_rate = sample_rate
    
    def analyze_beats(self, audio_buffer, partial_freq, bandwidth=10):
        """
        Analyse les battements autour d'une fréquence de partiel donnée.
        
        Args:
            audio_buffer (np.ndarray): Buffer audio
            partial_freq (float): Fréquence du partiel à analyser
            bandwidth (float): Largeur de bande du filtre en Hz
            
        Returns:
            dict: Dictionnaire contenant:
                - beat_frequency: Fréquence de battement détectée
                - envelope: Enveloppe du signal
                - filtered_signal: Signal filtré
        """
        if partial_freq <= 0 or partial_freq > self.sample_rate / 2:
            return None
        
        # Filtrage passe-bande autour du partiel
        filtered_signal = self._bandpass_filter(audio_buffer, partial_freq, bandwidth)
        
        # Extraction de l'enveloppe via transformée de Hilbert
        envelope = self._extract_envelope(filtered_signal)
        
        # Détection de la fréquence de battement dans l'enveloppe
        beat_frequency = self._detect_beat_frequency(envelope)
        
        return {
            'beat_frequency': beat_frequency,
            'envelope': envelope,
            'filtered_signal': filtered_signal
        }
    
    def _bandpass_filter(self, signal, center_freq, bandwidth):
        """
        Applique un filtre passe-bande autour de la fréquence centrale.
        
        Args:
            signal (np.ndarray): Signal d'entrée
            center_freq (float): Fréquence centrale
            bandwidth (float): Largeur de bande
            
        Returns:
            np.ndarray: Signal filtré
        """
        # Calculer les fréquences de coupure
        low_freq = max(center_freq - bandwidth / 2, 1)
        high_freq = min(center_freq + bandwidth / 2, self.sample_rate / 2 - 1)
        
        # Normaliser par rapport à la fréquence de Nyquist
        nyquist = self.sample_rate / 2
        low = low_freq / nyquist
        high = high_freq / nyquist
        
        # Créer un filtre Butterworth d'ordre 4
        try:
            b, a = butter(4, [low, high], btype='band')
            filtered = filtfilt(b, a, signal)
            return filtered
        except Exception as e:
            print(f"Filter error: {e}")
            return signal
    
    def _extract_envelope(self, signal):
        """
        Extrait l'enveloppe du signal via la transformée de Hilbert.
        
        Args:
            signal (np.ndarray): Signal d'entrée
            
        Returns:
            np.ndarray: Enveloppe du signal
        """
        # Transformée de Hilbert
        analytic_signal = hilbert(signal)
        
        # L'enveloppe est le module du signal analytique
        envelope = np.abs(analytic_signal)
        
        return envelope
    
    def _detect_beat_frequency(self, envelope):
        """
        Détecte la fréquence de battement dans l'enveloppe.
        
        Args:
            envelope (np.ndarray): Enveloppe du signal
            
        Returns:
            float: Fréquence de battement en Hz
        """
        # Enlever la composante DC
        envelope = envelope - np.mean(envelope)
        
        # FFT de l'enveloppe
        fft_envelope = np.fft.rfft(envelope)
        fft_freq = np.fft.rfftfreq(len(envelope), 1.0 / self.sample_rate)
        fft_magnitude = np.abs(fft_envelope)
        
        # Chercher le pic principal dans la plage des battements (0.1 - 20 Hz)
        # Les battements audibles sont généralement < 10 Hz
        mask = (fft_freq >= 0.1) & (fft_freq <= 20)
        
        if not np.any(mask):
            return 0.0
        
        masked_magnitude = fft_magnitude[mask]
        masked_freq = fft_freq[mask]
        
        if len(masked_magnitude) == 0:
            return 0.0
        
        # Trouver le pic maximum
        max_idx = np.argmax(masked_magnitude)
        beat_freq = masked_freq[max_idx]
        
        return beat_freq
    
    def get_beat_spectrum(self, envelope):
        """
        Calcule le spectre de l'enveloppe pour l'affichage.
        
        Args:
            envelope (np.ndarray): Enveloppe du signal
            
        Returns:
            tuple: (fréquences, magnitudes)
        """
        # Enlever la composante DC
        envelope = envelope - np.mean(envelope)
        
        # FFT
        fft_envelope = np.fft.rfft(envelope)
        fft_freq = np.fft.rfftfreq(len(envelope), 1.0 / self.sample_rate)
        fft_magnitude = np.abs(fft_envelope)
        
        # Limiter aux basses fréquences (battements)
        mask = fft_freq <= 30
        
        return fft_freq[mask], fft_magnitude[mask]
