"""
StretchModel - Calcul du stretch basé sur l'inharmonicité
"""
import numpy as np
from scipy.interpolate import interp1d


class StretchModel:
    """
    Calcule le stretch pour chaque note en fonction du coefficient B.
    """
    
    def __init__(self):
        """
        Initialise le modèle de stretch.
        """
        self.B_curve = None  # Courbe interpolée B(midi_note)
        self.midi_notes = []
        self.B_values = []
    
    def set_calibration_data(self, midi_notes, B_values):
        """
        Définit les données de calibration et crée la courbe interpolée.
        
        Args:
            midi_notes (list): Liste des notes MIDI calibrées
            B_values (list): Liste des coefficients B correspondants
        """
        if len(midi_notes) < 2:
            return
        
        self.midi_notes = np.array(midi_notes)
        self.B_values = np.array(B_values)
        
        # Créer une fonction d'interpolation
        # Utiliser 'linear' si peu de points, 'cubic' si suffisamment de points
        if len(midi_notes) >= 4:
            kind = 'cubic'
        else:
            kind = 'linear'
        
        self.B_curve = interp1d(
            self.midi_notes, 
            self.B_values, 
            kind=kind,
            bounds_error=False,
            fill_value='extrapolate'
        )
    
    def get_B_for_note(self, midi_note):
        """
        Obtient le coefficient B pour une note donnée (interpolé si nécessaire).
        
        Args:
            midi_note (int): Numéro MIDI
            
        Returns:
            float: Coefficient B, ou None si pas de calibration
        """
        if self.B_curve is None:
            # Valeur par défaut si pas de calibration
            return self._default_B(midi_note)
        
        try:
            B = float(self.B_curve(midi_note))
            # S'assurer que B reste dans une plage réaliste
            return max(0, min(B, 0.001))
        except:
            return self._default_B(midi_note)
    
    def _default_B(self, midi_note):
        """
        Retourne une valeur de B par défaut basée sur des approximations typiques.
        
        Args:
            midi_note (int): Numéro MIDI
            
        Returns:
            float: Coefficient B approximatif
        """
        # Approximation: B augmente dans les graves et les aigus
        # Piano typique: B varie de ~0.0001 dans le medium à ~0.0005 dans les extrêmes
        
        # Note centrale (A4 = 69)
        center_note = 69
        distance = abs(midi_note - center_note)
        
        # B minimal au centre, augmente vers les extrêmes
        B_min = 0.0001
        B_max = 0.0005
        
        # Fonction quadratique simple
        B = B_min + (B_max - B_min) * (distance / 40.0) ** 2
        
        return min(B, B_max)
    
    def calculate_stretch(self, midi_note, partial_number=1):
        """
        Calcule le stretch pour une note donnée.
        
        Le stretch affecte la fréquence cible: f_target = f_equal_temp * (1 + stretch)
        
        Args:
            midi_note (int): Numéro MIDI
            partial_number (int): Rang du partiel (1 pour fondamentale)
            
        Returns:
            float: Facteur de stretch
        """
        B = self.get_B_for_note(midi_note)
        
        if B is None or B <= 0:
            return 0.0
        
        # Formule du stretch basée sur l'inharmonicité
        # Pour la fondamentale: stretch ≈ B * k^2 / 2
        # Approximation au premier ordre: sqrt(1 + B*k^2) ≈ 1 + B*k^2/2
        k = partial_number
        stretch = (B * k ** 2) / 2.0
        
        return stretch
    
    def get_target_frequency(self, midi_note, use_stretch=True):
        """
        Calcule la fréquence cible pour une note MIDI donnée.
        
        Args:
            midi_note (int): Numéro MIDI
            use_stretch (bool): Appliquer le stretch ou non
            
        Returns:
            float: Fréquence cible en Hz
        """
        # Fréquence en tempérament égal
        f_equal_temp = 440.0 * (2.0 ** ((midi_note - 69) / 12.0))
        
        if not use_stretch:
            return f_equal_temp
        
        # Appliquer le stretch
        stretch = self.calculate_stretch(midi_note)
        f_target = f_equal_temp * (1 + stretch)
        
        return f_target
    
    def calculate_cents_deviation(self, measured_freq, target_freq):
        """
        Calcule l'écart en cents entre deux fréquences.
        
        cents = 1200 * log2(f_measured / f_target)
        
        Args:
            measured_freq (float): Fréquence mesurée
            target_freq (float): Fréquence cible
            
        Returns:
            float: Écart en cents
        """
        if measured_freq <= 0 or target_freq <= 0:
            return 0.0
        
        cents = 1200 * np.log2(measured_freq / target_freq)
        
        return cents
    
    def has_calibration(self):
        """
        Vérifie si le modèle a des données de calibration.
        
        Returns:
            bool: True si calibré
        """
        return self.B_curve is not None and len(self.midi_notes) > 0
