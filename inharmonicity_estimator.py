"""
InharmonicityEstimator - Estimation du coefficient d'inharmonicité B
"""
import numpy as np
from scipy.signal import find_peaks


class InharmonicityEstimator:
    """
    Estime le coefficient d'inharmonicité B en analysant les partiels.
    """
    
    def __init__(self, sample_rate=44100):
        """
        Initialise l'estimateur d'inharmonicité.
        
        Args:
            sample_rate (int): Fréquence d'échantillonnage
        """
        self.sample_rate = sample_rate
    
    def estimate_inharmonicity(self, audio_buffer, fundamental_freq, num_partials=6):
        """
        Estime le coefficient B à partir de l'analyse des partiels.
        
        Args:
            audio_buffer (np.ndarray): Buffer audio
            fundamental_freq (float): Fréquence fondamentale détectée
            num_partials (int): Nombre de partiels à analyser
            
        Returns:
            float: Coefficient B estimé, ou None si estimation impossible
        """
        if fundamental_freq is None or fundamental_freq <= 0:
            return None
        
        # Calculer la FFT
        fft_data = np.fft.rfft(audio_buffer)
        fft_freq = np.fft.rfftfreq(len(audio_buffer), 1.0 / self.sample_rate)
        fft_magnitude = np.abs(fft_data)
        
        # Détecter les pics de partiels
        partial_freqs = self._detect_partials(fft_freq, fft_magnitude, 
                                               fundamental_freq, num_partials)
        
        if len(partial_freqs) < 3:
            return None
        
        # Estimer B à partir des partiels mesurés
        B = self._compute_B_from_partials(partial_freqs, fundamental_freq)
        
        return B
    
    def _detect_partials(self, fft_freq, fft_magnitude, fundamental_freq, num_partials):
        """
        Détecte les fréquences des partiels dans le spectre.
        
        Args:
            fft_freq (np.ndarray): Fréquences FFT
            fft_magnitude (np.ndarray): Magnitude FFT
            fundamental_freq (float): Fréquence fondamentale
            num_partials (int): Nombre de partiels à détecter
            
        Returns:
            list: Liste des fréquences de partiels détectées
        """
        partial_freqs = []
        
        # Chercher autour de chaque partiel théorique
        for k in range(1, num_partials + 1):
            expected_freq = k * fundamental_freq
            
            # Fenêtre de recherche autour de la fréquence attendue (±5%)
            search_range = expected_freq * 0.05
            freq_min = expected_freq - search_range
            freq_max = expected_freq + search_range
            
            # Trouver les indices dans cette plage
            mask = (fft_freq >= freq_min) & (fft_freq <= freq_max)
            if not np.any(mask):
                continue
            
            # Trouver le pic maximum dans cette plage
            local_magnitude = fft_magnitude[mask]
            local_freq = fft_freq[mask]
            
            if len(local_magnitude) == 0:
                continue
            
            max_idx = np.argmax(local_magnitude)
            peak_freq = local_freq[max_idx]
            
            # Vérifier que le pic est suffisamment fort
            if local_magnitude[max_idx] > np.mean(fft_magnitude) * 2:
                partial_freqs.append((k, peak_freq))
        
        return partial_freqs
    
    def _compute_B_from_partials(self, partial_freqs, fundamental_freq):
        """
        Calcule le coefficient B à partir des partiels mesurés.
        
        Formule: f_partial(k) = k * f0 * sqrt(1 + B * k^2)
        Donc: B = ((f_partial / (k * f0))^2 - 1) / k^2
        
        Args:
            partial_freqs (list): Liste de tuples (k, fréquence_mesurée)
            fundamental_freq (float): Fréquence fondamentale
            
        Returns:
            float: Coefficient B moyen
        """
        B_values = []
        
        for k, measured_freq in partial_freqs:
            if k == 0:
                continue
            
            # Calculer B pour ce partiel
            ratio = measured_freq / (k * fundamental_freq)
            if ratio > 0:
                B_k = (ratio ** 2 - 1) / (k ** 2)
                
                # Filtrer les valeurs aberrantes
                if 0 <= B_k <= 0.001:  # B typiquement entre 0 et 0.001 pour un piano
                    B_values.append(B_k)
        
        if len(B_values) == 0:
            return None
        
        # Retourner la moyenne des B estimés
        return np.mean(B_values)
    
    def get_spectrum(self, audio_buffer):
        """
        Calcule le spectre de fréquences pour l'affichage.
        
        Args:
            audio_buffer (np.ndarray): Buffer audio
            
        Returns:
            tuple: (fréquences, magnitudes)
        """
        fft_data = np.fft.rfft(audio_buffer)
        fft_freq = np.fft.rfftfreq(len(audio_buffer), 1.0 / self.sample_rate)
        fft_magnitude = np.abs(fft_data)
        
        # Convertir en dB
        epsilon = 1e-10
        fft_magnitude_db = 20 * np.log10(fft_magnitude + epsilon)
        
        return fft_freq, fft_magnitude_db
