"""
CalibrationManager - Gestion de la calibration et sauvegarde/chargement
"""
import json
import os
import numpy as np


class CalibrationManager:
    """
    Orchestre la phase de calibration, enregistre les mesures et gère
    la sauvegarde/chargement du profil.
    """
    
    def __init__(self, filename="calibration_profile.json"):
        """
        Initialise le gestionnaire de calibration.
        
        Args:
            filename (str): Nom du fichier de sauvegarde
        """
        self.filename = filename
        self.is_calibrating = False
        self.calibration_data = []  # Liste de dict {midi_note, frequency, B}
    
    def start_calibration(self):
        """Démarre une nouvelle session de calibration."""
        self.is_calibrating = True
        self.calibration_data = []
        print("Calibration started. Play notes to calibrate.")
    
    def stop_calibration(self):
        """Arrête la session de calibration."""
        self.is_calibrating = False
        print("Calibration stopped.")
    
    def add_measurement(self, midi_note, frequency, B_coefficient):
        """
        Ajoute une mesure de calibration.
        
        Args:
            midi_note (int): Numéro MIDI de la note
            frequency (float): Fréquence mesurée
            B_coefficient (float): Coefficient B estimé
        """
        if not self.is_calibrating:
            return
        
        # Vérifier si cette note existe déjà
        existing_idx = None
        for i, measurement in enumerate(self.calibration_data):
            if measurement['midi_note'] == midi_note:
                existing_idx = i
                break
        
        measurement = {
            'midi_note': midi_note,
            'frequency': frequency,
            'B': B_coefficient
        }
        
        if existing_idx is not None:
            # Remplacer la mesure existante
            self.calibration_data[existing_idx] = measurement
            print(f"Updated calibration for MIDI {midi_note}")
        else:
            # Ajouter une nouvelle mesure
            self.calibration_data.append(measurement)
            print(f"Added calibration for MIDI {midi_note}: B={B_coefficient:.6f}")
    
    def get_calibration_data(self):
        """
        Retourne les données de calibration sous forme de listes.
        
        Returns:
            tuple: (midi_notes, B_values)
        """
        if len(self.calibration_data) == 0:
            return [], []
        
        # Trier par note MIDI
        sorted_data = sorted(self.calibration_data, key=lambda x: x['midi_note'])
        
        midi_notes = [d['midi_note'] for d in sorted_data]
        B_values = [d['B'] for d in sorted_data]
        
        return midi_notes, B_values
    
    def save_profile(self):
        """
        Sauvegarde le profil de calibration dans un fichier JSON.
        
        Returns:
            bool: True si succès, False sinon
        """
        if len(self.calibration_data) == 0:
            print("No calibration data to save.")
            return False
        
        try:
            # Préparer les données pour la sérialisation
            profile = {
                'version': '1.0',
                'calibration_data': self.calibration_data,
                'num_measurements': len(self.calibration_data)
            }
            
            # Sauvegarder dans le fichier
            with open(self.filename, 'w') as f:
                json.dump(profile, f, indent=2)
            
            print(f"Calibration profile saved to {self.filename}")
            return True
        
        except Exception as e:
            print(f"Error saving calibration profile: {e}")
            return False
    
    def load_profile(self):
        """
        Charge le profil de calibration depuis un fichier JSON.
        
        Returns:
            bool: True si succès, False sinon
        """
        if not os.path.exists(self.filename):
            print(f"No calibration profile found at {self.filename}")
            return False
        
        try:
            with open(self.filename, 'r') as f:
                profile = json.load(f)
            
            # Vérifier la version
            if profile.get('version') != '1.0':
                print("Incompatible calibration profile version.")
                return False
            
            # Charger les données
            self.calibration_data = profile.get('calibration_data', [])
            
            print(f"Loaded {len(self.calibration_data)} calibration measurements")
            return True
        
        except Exception as e:
            print(f"Error loading calibration profile: {e}")
            return False
    
    def has_calibration(self):
        """
        Vérifie si des données de calibration sont disponibles.
        
        Returns:
            bool: True si des données existent
        """
        return len(self.calibration_data) > 0
    
    def clear_calibration(self):
        """Efface toutes les données de calibration."""
        self.calibration_data = []
        print("Calibration data cleared.")
    
    def get_calibration_summary(self):
        """
        Retourne un résumé de la calibration.
        
        Returns:
            str: Résumé textuel
        """
        if len(self.calibration_data) == 0:
            return "No calibration data available."
        
        midi_notes, B_values = self.get_calibration_data()
        
        summary = f"Calibration Summary:\n"
        summary += f"  Number of notes: {len(midi_notes)}\n"
        summary += f"  MIDI range: {min(midi_notes)} - {max(midi_notes)}\n"
        summary += f"  B range: {min(B_values):.6f} - {max(B_values):.6f}\n"
        
        return summary
