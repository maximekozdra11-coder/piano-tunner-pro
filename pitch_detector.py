"""
PitchDetector - Détection de la fréquence fondamentale avec l'algorithme YIN
"""
import numpy as np


class PitchDetector:
    """
    Détecteur de hauteur utilisant l'algorithme YIN pour une détection robuste
    de la fréquence fondamentale.
    """
    
    def __init__(self, sample_rate=44100, threshold=0.1):
        """
        Initialise le détecteur de hauteur.
        
        Args:
            sample_rate (int): Fréquence d'échantillonnage
            threshold (float): Seuil pour l'algorithme YIN (typiquement 0.1-0.15)
        """
        self.sample_rate = sample_rate
        self.threshold = threshold
    
    def detect_pitch(self, audio_buffer):
        """
        Détecte la fréquence fondamentale dans le buffer audio avec YIN.
        
        Args:
            audio_buffer (np.ndarray): Buffer audio
            
        Returns:
            float: Fréquence détectée en Hz, ou None si aucune détection
        """
        if len(audio_buffer) < 2:
            return None
        
        # Normaliser le signal
        audio_buffer = audio_buffer - np.mean(audio_buffer)
        
        # Calculer la fonction de différence
        diff_function = self._difference_function(audio_buffer)
        
        # Calculer la fonction de différence cumulée normalisée (CMNDF)
        cmndf = self._cumulative_mean_normalized_difference(diff_function)
        
        # Trouver le minimum absolu sous le seuil
        tau = self._absolute_threshold(cmndf, self.threshold)
        
        if tau == 0:
            return None
        
        # Interpolation parabolique pour une meilleure précision
        tau = self._parabolic_interpolation(cmndf, tau)
        
        # Convertir tau en fréquence
        frequency = self.sample_rate / tau
        
        # Filtrer les fréquences non réalistes pour un piano (27.5 Hz - 3520 Hz)
        if frequency < 20 or frequency > 5000:
            return None
        
        return frequency
    
    def _difference_function(self, audio_buffer):
        """
        Calcule la fonction de différence de l'algorithme YIN.
        
        Args:
            audio_buffer (np.ndarray): Buffer audio
            
        Returns:
            np.ndarray: Fonction de différence
        """
        buffer_size = len(audio_buffer)
        half_size = buffer_size // 2
        
        diff = np.zeros(half_size)
        
        for tau in range(1, half_size):
            for i in range(half_size):
                delta = audio_buffer[i] - audio_buffer[i + tau]
                diff[tau] += delta * delta
        
        return diff
    
    def _cumulative_mean_normalized_difference(self, diff_function):
        """
        Calcule la différence cumulée moyenne normalisée (CMNDF).
        
        Args:
            diff_function (np.ndarray): Fonction de différence
            
        Returns:
            np.ndarray: CMNDF
        """
        cmndf = np.zeros_like(diff_function)
        cmndf[0] = 1
        
        cumulative_sum = 0
        for tau in range(1, len(diff_function)):
            cumulative_sum += diff_function[tau]
            if cumulative_sum == 0:
                cmndf[tau] = 1
            else:
                cmndf[tau] = diff_function[tau] * tau / cumulative_sum
        
        return cmndf
    
    def _absolute_threshold(self, cmndf, threshold):
        """
        Trouve le premier minimum sous le seuil.
        
        Args:
            cmndf (np.ndarray): CMNDF
            threshold (float): Seuil
            
        Returns:
            int: Indice tau
        """
        tau = 2  # Commencer à tau=2 pour éviter les valeurs trop basses
        
        while tau < len(cmndf):
            if cmndf[tau] < threshold:
                while tau + 1 < len(cmndf) and cmndf[tau + 1] < cmndf[tau]:
                    tau += 1
                return tau
            tau += 1
        
        # Si aucun minimum trouvé, retourner le minimum global
        if len(cmndf) > 2:
            return np.argmin(cmndf[2:]) + 2
        
        return 0
    
    def _parabolic_interpolation(self, cmndf, tau):
        """
        Interpolation parabolique pour améliorer la précision.
        
        Args:
            cmndf (np.ndarray): CMNDF
            tau (int): Indice du minimum
            
        Returns:
            float: Tau interpolé
        """
        if tau == 0 or tau >= len(cmndf) - 1:
            return tau
        
        # Utiliser les 3 points autour du minimum
        x0, x1, x2 = tau - 1, tau, tau + 1
        y0, y1, y2 = cmndf[x0], cmndf[x1], cmndf[x2]
        
        # Interpolation parabolique
        denom = 2 * (2 * y1 - y0 - y2)
        if abs(denom) < 1e-10:
            return tau
        
        better_tau = tau + (y2 - y0) / denom
        
        return better_tau
    
    def frequency_to_midi(self, frequency):
        """
        Convertit une fréquence en numéro de note MIDI.
        
        Args:
            frequency (float): Fréquence en Hz
            
        Returns:
            int: Numéro MIDI (0-127), ou None si fréquence invalide
        """
        if frequency is None or frequency <= 0:
            return None
        
        # Formule MIDI: n = 69 + 12 * log2(f / 440)
        midi_number = 69 + 12 * np.log2(frequency / 440.0)
        
        # Arrondir au demi-ton le plus proche
        midi_note = int(round(midi_number))
        
        # Limiter à la plage MIDI valide
        if midi_note < 0 or midi_note > 127:
            return None
        
        return midi_note
    
    def midi_to_frequency(self, midi_note):
        """
        Convertit un numéro MIDI en fréquence (tempérament égal, A4=440Hz).
        
        Args:
            midi_note (int): Numéro MIDI
            
        Returns:
            float: Fréquence en Hz
        """
        # f = 440 * 2^((n - 69) / 12)
        return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))
    
    def midi_to_note_name(self, midi_note):
        """
        Convertit un numéro MIDI en nom de note.
        
        Args:
            midi_note (int): Numéro MIDI
            
        Returns:
            str: Nom de la note (ex: "A4", "C#5")
        """
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        octave = (midi_note // 12) - 1
        note = note_names[midi_note % 12]
        return f"{note}{octave}"
