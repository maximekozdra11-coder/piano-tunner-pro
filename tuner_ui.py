"""
TunerUI - Interface graphique PyQt6 pour l'accordeur de piano
"""
import sys
import numpy as np
from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLabel, QSpinBox, QGroupBox, QDialog)
from PyQt6.QtCore import QTimer, Qt
from PyQt6.QtGui import QPainter, QColor, QPen, QFont
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


class CentsMeter(QWidget):
    """
    Widget personnalisé pour afficher le curseur de cents (±50 cents).
    """
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.cents_value = 0.0
        self.setMinimumHeight(80)
    
    def set_cents(self, cents):
        """Définit la valeur en cents à afficher."""
        self.cents_value = max(-50, min(50, cents))
        self.update()
    
    def paintEvent(self, event):
        """Dessine le curseur de cents."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Dimensions
        width = self.width()
        height = self.height()
        center_x = width // 2
        
        # Dessiner la ligne de base
        painter.setPen(QPen(QColor(100, 100, 100), 2))
        painter.drawLine(50, height // 2, width - 50, height // 2)
        
        # Dessiner les graduations
        for cents in [-50, -25, 0, 25, 50]:
            x = center_x + int((cents / 50.0) * (width // 2 - 60))
            painter.drawLine(x, height // 2 - 10, x, height // 2 + 10)
            
            # Étiquettes
            painter.setFont(QFont("Arial", 8))
            if cents == 0:
                painter.setPen(QColor(0, 200, 0))
            else:
                painter.setPen(QColor(100, 100, 100))
            painter.drawText(x - 15, height // 2 + 25, f"{cents:+d}")
        
        # Dessiner l'aiguille
        needle_x = center_x + int((self.cents_value / 50.0) * (width // 2 - 60))
        
        # Couleur en fonction de l'écart
        if abs(self.cents_value) < 5:
            color = QColor(0, 200, 0)  # Vert
        elif abs(self.cents_value) < 15:
            color = QColor(255, 165, 0)  # Orange
        else:
            color = QColor(200, 0, 0)  # Rouge
        
        painter.setPen(QPen(color, 3))
        painter.drawLine(needle_x, height // 2 - 20, needle_x, height // 2 + 20)
        
        # Cercle au bout de l'aiguille
        painter.setBrush(color)
        painter.drawEllipse(needle_x - 5, height // 2 - 5, 10, 10)


class SpectrumWidget(QWidget):
    """
    Widget matplotlib pour afficher le spectre en temps réel.
    """
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # Créer la figure matplotlib
        self.figure = Figure(figsize=(8, 3))
        self.canvas = FigureCanvas(self.figure)
        self.ax = self.figure.add_subplot(111)
        
        # Configuration initiale
        self.ax.set_xlabel('Fréquence (Hz)')
        self.ax.set_ylabel('Magnitude (dB)')
        self.ax.set_xlim(0, 2000)
        self.ax.set_ylim(-60, 0)
        self.ax.grid(True, alpha=0.3)
        
        # Layout
        layout = QVBoxLayout()
        layout.addWidget(self.canvas)
        self.setLayout(layout)
        
        # Ligne de spectre
        self.spectrum_line, = self.ax.plot([], [], 'b-', linewidth=0.5)
    
    def update_spectrum(self, frequencies, magnitudes):
        """Met à jour le spectre affiché."""
        if len(frequencies) == 0 or len(magnitudes) == 0:
            return
        
        self.spectrum_line.set_data(frequencies, magnitudes)
        
        # Ajuster les limites si nécessaire
        if len(magnitudes) > 0:
            max_mag = np.max(magnitudes)
            min_mag = np.min(magnitudes)
            self.ax.set_ylim(min(min_mag, -60), max(max_mag, 0))
        
        self.canvas.draw_idle()


class BeatAnalysisDialog(QDialog):
    """
    Fenêtre secondaire pour l'analyse des battements.
    """
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Analyse des battements")
        self.setGeometry(100, 100, 600, 500)
        
        layout = QVBoxLayout()
        
        # Contrôles
        control_layout = QHBoxLayout()
        control_layout.addWidget(QLabel("Partiel à analyser (k):"))
        
        self.partial_spinbox = QSpinBox()
        self.partial_spinbox.setMinimum(1)
        self.partial_spinbox.setMaximum(10)
        self.partial_spinbox.setValue(2)
        control_layout.addWidget(self.partial_spinbox)
        
        control_layout.addStretch()
        layout.addLayout(control_layout)
        
        # Affichage de la fréquence de battement
        self.beat_freq_label = QLabel("Fréquence de battement: -- Hz")
        self.beat_freq_label.setFont(QFont("Arial", 12, QFont.Weight.Bold))
        layout.addWidget(self.beat_freq_label)
        
        # Graphique de l'enveloppe
        self.envelope_figure = Figure(figsize=(6, 2))
        self.envelope_canvas = FigureCanvas(self.envelope_figure)
        self.envelope_ax = self.envelope_figure.add_subplot(111)
        self.envelope_ax.set_xlabel('Temps (s)')
        self.envelope_ax.set_ylabel('Amplitude')
        self.envelope_ax.set_title('Enveloppe du signal filtré')
        self.envelope_ax.grid(True, alpha=0.3)
        layout.addWidget(self.envelope_canvas)
        
        # Graphique du spectre de l'enveloppe
        self.beat_spectrum_figure = Figure(figsize=(6, 2))
        self.beat_spectrum_canvas = FigureCanvas(self.beat_spectrum_figure)
        self.beat_spectrum_ax = self.beat_spectrum_figure.add_subplot(111)
        self.beat_spectrum_ax.set_xlabel('Fréquence (Hz)')
        self.beat_spectrum_ax.set_ylabel('Magnitude')
        self.beat_spectrum_ax.set_title('Spectre de l\'enveloppe (battements)')
        self.beat_spectrum_ax.set_xlim(0, 20)
        self.beat_spectrum_ax.grid(True, alpha=0.3)
        layout.addWidget(self.beat_spectrum_canvas)
        
        self.setLayout(layout)
    
    def update_beat_analysis(self, envelope, beat_frequencies, beat_magnitudes, beat_freq, sample_rate):
        """Met à jour les graphiques d'analyse des battements."""
        # Mettre à jour l'enveloppe
        self.envelope_ax.clear()
        time_axis = np.arange(len(envelope)) / sample_rate
        self.envelope_ax.plot(time_axis, envelope, 'b-', linewidth=0.5)
        self.envelope_ax.set_xlabel('Temps (s)')
        self.envelope_ax.set_ylabel('Amplitude')
        self.envelope_ax.set_title('Enveloppe du signal filtré')
        self.envelope_ax.grid(True, alpha=0.3)
        self.envelope_canvas.draw_idle()
        
        # Mettre à jour le spectre
        self.beat_spectrum_ax.clear()
        self.beat_spectrum_ax.plot(beat_frequencies, beat_magnitudes, 'r-', linewidth=1)
        self.beat_spectrum_ax.set_xlabel('Fréquence (Hz)')
        self.beat_spectrum_ax.set_ylabel('Magnitude')
        self.beat_spectrum_ax.set_title('Spectre de l\'enveloppe (battements)')
        self.beat_spectrum_ax.set_xlim(0, 20)
        self.beat_spectrum_ax.grid(True, alpha=0.3)
        self.beat_spectrum_canvas.draw_idle()
        
        # Afficher la fréquence de battement
        self.beat_freq_label.setText(f"Fréquence de battement: {beat_freq:.2f} Hz")


class TunerUI(QMainWindow):
    """
    Fenêtre principale de l'interface d'accordage.
    """
    
    def __init__(self, audio_processor, pitch_detector, inharmonicity_estimator,
                 stretch_model, beat_analyzer, calibration_manager):
        super().__init__()
        
        # Références aux modules
        self.audio_processor = audio_processor
        self.pitch_detector = pitch_detector
        self.inharmonicity_estimator = inharmonicity_estimator
        self.stretch_model = stretch_model
        self.beat_analyzer = beat_analyzer
        self.calibration_manager = calibration_manager
        
        # État
        self.current_frequency = None
        self.current_midi_note = None
        self.current_B = None
        self.beat_dialog = None
        
        # Interface
        self.init_ui()
        
        # Timer pour mise à jour
        self.update_timer = QTimer()
        self.update_timer.timeout.connect(self.update_display)
        self.update_timer.start(50)  # 20 FPS
    
    def init_ui(self):
        """Initialise l'interface utilisateur."""
        self.setWindowTitle("Piano Tuner Pro")
        self.setGeometry(100, 100, 900, 700)
        
        # Widget central
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout()
        central_widget.setLayout(main_layout)
        
        # Groupe d'affichage principal
        display_group = QGroupBox("Accordage")
        display_layout = QVBoxLayout()
        
        # Curseur de cents
        self.cents_meter = CentsMeter()
        display_layout.addWidget(self.cents_meter)
        
        # Informations de fréquence
        info_layout = QHBoxLayout()
        
        self.freq_measured_label = QLabel("Fréquence mesurée: -- Hz")
        self.freq_measured_label.setFont(QFont("Arial", 12))
        info_layout.addWidget(self.freq_measured_label)
        
        self.freq_target_label = QLabel("Fréquence cible: -- Hz")
        self.freq_target_label.setFont(QFont("Arial", 12))
        info_layout.addWidget(self.freq_target_label)
        
        display_layout.addLayout(info_layout)
        
        # Écart en cents
        self.cents_label = QLabel("Écart: -- cents")
        self.cents_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        self.cents_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        display_layout.addWidget(self.cents_label)
        
        # Note détectée
        self.note_label = QLabel("Note: --")
        self.note_label.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        self.note_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        display_layout.addWidget(self.note_label)
        
        display_group.setLayout(display_layout)
        main_layout.addWidget(display_group)
        
        # Spectre
        spectrum_group = QGroupBox("Spectre en temps réel")
        spectrum_layout = QVBoxLayout()
        self.spectrum_widget = SpectrumWidget()
        spectrum_layout.addWidget(self.spectrum_widget)
        spectrum_group.setLayout(spectrum_layout)
        main_layout.addWidget(spectrum_group)
        
        # Boutons de contrôle
        control_layout = QHBoxLayout()
        
        self.start_button = QPushButton("Démarrer")
        self.start_button.clicked.connect(self.start_tuning)
        control_layout.addWidget(self.start_button)
        
        self.stop_button = QPushButton("Arrêter")
        self.stop_button.clicked.connect(self.stop_tuning)
        self.stop_button.setEnabled(False)
        control_layout.addWidget(self.stop_button)
        
        self.beat_button = QPushButton("Analyse des battements")
        self.beat_button.clicked.connect(self.show_beat_analysis)
        control_layout.addWidget(self.beat_button)
        
        main_layout.addLayout(control_layout)
        
        # Calibration
        calib_group = QGroupBox("Calibration")
        calib_layout = QHBoxLayout()
        
        self.calib_start_button = QPushButton("Démarrer calibration")
        self.calib_start_button.clicked.connect(self.start_calibration)
        calib_layout.addWidget(self.calib_start_button)
        
        self.calib_stop_button = QPushButton("Arrêter calibration")
        self.calib_stop_button.clicked.connect(self.stop_calibration)
        self.calib_stop_button.setEnabled(False)
        calib_layout.addWidget(self.calib_stop_button)
        
        self.calib_save_button = QPushButton("Sauvegarder profil")
        self.calib_save_button.clicked.connect(self.save_calibration)
        calib_layout.addWidget(self.calib_save_button)
        
        self.calib_status_label = QLabel("Pas de calibration")
        calib_layout.addWidget(self.calib_status_label)
        
        calib_group.setLayout(calib_layout)
        main_layout.addWidget(calib_group)
    
    def start_tuning(self):
        """Démarre l'accordage."""
        try:
            self.audio_processor.start()
            self.start_button.setEnabled(False)
            self.stop_button.setEnabled(True)
        except Exception as e:
            print(f"Error starting tuning: {e}")
    
    def stop_tuning(self):
        """Arrête l'accordage."""
        self.audio_processor.stop()
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
    
    def update_display(self):
        """Met à jour l'affichage."""
        if not self.audio_processor.is_running:
            return
        
        # Obtenir le buffer audio
        buffer = self.audio_processor.get_buffer()
        
        if len(buffer) < 1024:
            return
        
        # Détecter la hauteur
        frequency = self.pitch_detector.detect_pitch(buffer)
        
        if frequency is None:
            return
        
        self.current_frequency = frequency
        
        # Convertir en note MIDI
        midi_note = self.pitch_detector.frequency_to_midi(frequency)
        if midi_note is None:
            return
        
        self.current_midi_note = midi_note
        note_name = self.pitch_detector.midi_to_note_name(midi_note)
        
        # Calculer la fréquence cible
        target_frequency = self.stretch_model.get_target_frequency(midi_note)
        
        # Calculer l'écart en cents
        cents = self.stretch_model.calculate_cents_deviation(frequency, target_frequency)
        
        # Mettre à jour l'affichage
        self.freq_measured_label.setText(f"Fréquence mesurée: {frequency:.2f} Hz")
        self.freq_target_label.setText(f"Fréquence cible: {target_frequency:.2f} Hz")
        self.cents_label.setText(f"Écart: {cents:+.1f} cents")
        self.note_label.setText(f"Note: {note_name}")
        self.cents_meter.set_cents(cents)
        
        # Mettre à jour le spectre
        freq_spectrum, mag_spectrum = self.inharmonicity_estimator.get_spectrum(buffer)
        self.spectrum_widget.update_spectrum(freq_spectrum, mag_spectrum)
        
        # Si en mode calibration, ajouter la mesure
        if self.calibration_manager.is_calibrating:
            B = self.inharmonicity_estimator.estimate_inharmonicity(buffer, frequency)
            if B is not None:
                self.current_B = B
                # Ajouter uniquement si stable (éviter les ajouts trop fréquents)
                # On peut implémenter une logique de détection de stabilité ici
    
    def start_calibration(self):
        """Démarre la calibration."""
        self.calibration_manager.start_calibration()
        self.calib_start_button.setEnabled(False)
        self.calib_stop_button.setEnabled(True)
        self.calib_status_label.setText("Calibration en cours...")
    
    def stop_calibration(self):
        """Arrête la calibration."""
        self.calibration_manager.stop_calibration()
        
        # Mettre à jour le modèle de stretch
        midi_notes, B_values = self.calibration_manager.get_calibration_data()
        if len(midi_notes) > 0:
            self.stretch_model.set_calibration_data(midi_notes, B_values)
            self.calib_status_label.setText(f"Calibré: {len(midi_notes)} notes")
        
        self.calib_start_button.setEnabled(True)
        self.calib_stop_button.setEnabled(False)
    
    def save_calibration(self):
        """Sauvegarde la calibration."""
        # Si en cours de calibration, ajouter la mesure actuelle
        if self.calibration_manager.is_calibrating:
            if self.current_midi_note is not None and self.current_B is not None:
                self.calibration_manager.add_measurement(
                    self.current_midi_note, 
                    self.current_frequency, 
                    self.current_B
                )
        
        success = self.calibration_manager.save_profile()
        if success:
            self.calib_status_label.setText("Profil sauvegardé!")
    
    def show_beat_analysis(self):
        """Affiche la fenêtre d'analyse des battements."""
        if self.beat_dialog is None:
            self.beat_dialog = BeatAnalysisDialog(self)
        
        # Mettre à jour les données de battements
        if self.current_frequency is not None:
            buffer = self.audio_processor.get_buffer()
            if len(buffer) > 1024:
                partial_k = self.beat_dialog.partial_spinbox.value()
                partial_freq = self.current_frequency * partial_k
                
                result = self.beat_analyzer.analyze_beats(buffer, partial_freq)
                
                if result is not None:
                    beat_freq, beat_mag = self.beat_analyzer.get_beat_spectrum(result['envelope'])
                    self.beat_dialog.update_beat_analysis(
                        result['envelope'],
                        beat_freq,
                        beat_mag,
                        result['beat_frequency'],
                        self.audio_processor.sample_rate
                    )
        
        self.beat_dialog.show()
    
    def closeEvent(self, event):
        """Gérer la fermeture de la fenêtre."""
        self.audio_processor.stop()
        event.accept()
