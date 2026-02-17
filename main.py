"""
Piano Tuner Pro - Application principale
Point d'entrée de l'application d'accordage de piano haute précision
"""
import sys
from PyQt6.QtWidgets import QApplication

from audio_processor import AudioProcessor
from pitch_detector import PitchDetector
from inharmonicity_estimator import InharmonicityEstimator
from stretch_model import StretchModel
from beat_analyzer import BeatAnalyzer
from calibration_manager import CalibrationManager
from tuner_ui import TunerUI


def main():
    """
    Point d'entrée principal de l'application.
    """
    # Créer l'application Qt
    app = QApplication(sys.argv)
    app.setApplicationName("Piano Tuner Pro")
    
    # Paramètres audio
    sample_rate = 44100
    buffer_size = 8192
    
    # Initialiser les modules
    print("Initializing Piano Tuner Pro...")
    
    # Gestionnaire de calibration
    calibration_manager = CalibrationManager("calibration_profile.json")
    
    # Charger le profil de calibration s'il existe
    calibration_manager.load_profile()
    
    # Modèle de stretch
    stretch_model = StretchModel()
    
    # Si calibration disponible, l'appliquer
    if calibration_manager.has_calibration():
        midi_notes, B_values = calibration_manager.get_calibration_data()
        stretch_model.set_calibration_data(midi_notes, B_values)
        print(f"Loaded calibration with {len(midi_notes)} notes")
        print(calibration_manager.get_calibration_summary())
    else:
        print("No calibration profile found. Using default B values.")
    
    # Détecteur de hauteur
    pitch_detector = PitchDetector(sample_rate=sample_rate, threshold=0.1)
    
    # Estimateur d'inharmonicité
    inharmonicity_estimator = InharmonicityEstimator(sample_rate=sample_rate)
    
    # Analyseur de battements
    beat_analyzer = BeatAnalyzer(sample_rate=sample_rate)
    
    # Processeur audio
    audio_processor = AudioProcessor(
        sample_rate=sample_rate,
        buffer_size=buffer_size
    )
    
    # Interface utilisateur
    window = TunerUI(
        audio_processor=audio_processor,
        pitch_detector=pitch_detector,
        inharmonicity_estimator=inharmonicity_estimator,
        stretch_model=stretch_model,
        beat_analyzer=beat_analyzer,
        calibration_manager=calibration_manager
    )
    
    # Afficher la fenêtre
    window.show()
    
    print("Piano Tuner Pro started successfully!")
    print("Click 'Démarrer' to begin tuning.")
    
    # Lancer la boucle d'événements
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
