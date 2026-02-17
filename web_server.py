"""
Piano Tuner Pro - Serveur Web
Application web pour accordage de piano accessible depuis mobile (iPhone)
"""
from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit
import numpy as np
import base64
import json
import os

# Import des modules existants
from pitch_detector import PitchDetector
from inharmonicity_estimator import InharmonicityEstimator
from stretch_model import StretchModel
from beat_analyzer import BeatAnalyzer
from calibration_manager import CalibrationManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'piano-tuner-pro-secret-key-2026'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration audio
SAMPLE_RATE = 44100
BUFFER_SIZE = 8192

# Initialisation des modules (instances globales)
pitch_detector = PitchDetector(sample_rate=SAMPLE_RATE, threshold=0.1)
inharmonicity_estimator = InharmonicityEstimator(sample_rate=SAMPLE_RATE)
stretch_model = StretchModel()
beat_analyzer = BeatAnalyzer(sample_rate=SAMPLE_RATE)
calibration_manager = CalibrationManager("calibration_profile.json")

# Charger la calibration au démarrage
calibration_manager.load_profile()
if calibration_manager.has_calibration():
    midi_notes, B_values = calibration_manager.get_calibration_data()
    stretch_model.set_calibration_data(midi_notes, B_values)
    print(f"✓ Loaded calibration with {len(midi_notes)} notes")
else:
    print("ℹ No calibration profile found. Using default B values.")


@app.route('/')
def index():
    """Page d'accueil - interface d'accordage"""
    return render_template('index.html')


@app.route('/api/config')
def get_config():
    """Retourne la configuration audio"""
    return jsonify({
        'sample_rate': SAMPLE_RATE,
        'buffer_size': BUFFER_SIZE,
        'has_calibration': calibration_manager.has_calibration()
    })


@socketio.on('connect')
def handle_connect():
    """Gestion de la connexion WebSocket"""
    print(f"Client connected: {request.sid}")
    emit('status', {'message': 'Connected to Piano Tuner Pro server'})


@socketio.on('disconnect')
def handle_disconnect():
    """Gestion de la déconnexion"""
    print(f"Client disconnected: {request.sid}")


@socketio.on('audio_data')
def handle_audio_data(data):
    """
    Traite les données audio reçues du client
    
    Args:
        data: dict contenant 'audio' (array de floats) et 'sample_rate'
    """
    try:
        # Récupérer les données audio
        audio_array = np.array(data['audio'], dtype=np.float32)
        
        if len(audio_array) < 100:
            return
        
        # Détection de la hauteur avec YIN
        frequency = pitch_detector.detect_pitch(audio_array)
        
        if frequency is None:
            emit('analysis_result', {
                'frequency': None,
                'note': None,
                'cents': 0,
                'target_frequency': None
            })
            return
        
        # Convertir en note MIDI
        midi_note = pitch_detector.frequency_to_midi(frequency)
        if midi_note is None:
            return
        
        note_name = pitch_detector.midi_to_note_name(midi_note)
        
        # Calculer la fréquence cible avec stretch
        target_frequency = stretch_model.get_target_frequency(midi_note, use_stretch=True)
        
        # Calculer l'écart en cents
        cents = stretch_model.calculate_cents_deviation(frequency, target_frequency)
        
        # Estimer l'inharmonicité (optionnel, plus lourd)
        # B = inharmonicity_estimator.estimate_inharmonicity(audio_array, frequency)
        
        # Calculer le spectre pour affichage
        freq_spectrum, mag_spectrum = inharmonicity_estimator.get_spectrum(audio_array)
        
        # Limiter les données du spectre pour la transmission
        spectrum_data = {
            'frequencies': freq_spectrum[:500].tolist(),  # Limiter à 500 points
            'magnitudes': mag_spectrum[:500].tolist()
        }
        
        # Envoyer le résultat
        emit('analysis_result', {
            'frequency': float(frequency),
            'note': note_name,
            'midi': int(midi_note),
            'cents': float(cents),
            'target_frequency': float(target_frequency),
            'spectrum': spectrum_data
        })
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        emit('error', {'message': str(e)})


@socketio.on('start_calibration')
def handle_start_calibration():
    """Démarre une session de calibration"""
    calibration_manager.start_calibration()
    emit('calibration_status', {
        'status': 'started',
        'message': 'Calibration démarrée. Jouez des notes.'
    })


@socketio.on('stop_calibration')
def handle_stop_calibration():
    """Arrête la calibration"""
    calibration_manager.stop_calibration()
    
    # Mettre à jour le stretch model
    midi_notes, B_values = calibration_manager.get_calibration_data()
    if len(midi_notes) > 0:
        stretch_model.set_calibration_data(midi_notes, B_values)
    
    emit('calibration_status', {
        'status': 'stopped',
        'count': len(midi_notes),
        'message': f'Calibration arrêtée. {len(midi_notes)} notes enregistrées.'
    })


@socketio.on('save_calibration')
def handle_save_calibration(data):
    """
    Sauvegarde une mesure de calibration
    
    Args:
        data: dict avec 'midi_note', 'frequency', 'B'
    """
    try:
        midi_note = data['midi_note']
        frequency = data['frequency']
        B = data.get('B', 0.0001)  # Valeur par défaut si non fournie
        
        calibration_manager.add_measurement(midi_note, frequency, B)
        
        # Sauvegarder le profil
        success = calibration_manager.save_profile()
        
        emit('calibration_saved', {
            'success': success,
            'midi_note': midi_note,
            'message': f'Note MIDI {midi_note} enregistrée'
        })
        
    except Exception as e:
        print(f"Error saving calibration: {e}")
        emit('error', {'message': str(e)})


@socketio.on('analyze_beats')
def handle_analyze_beats(data):
    """
    Analyse les battements pour un partiel donné
    
    Args:
        data: dict avec 'audio', 'frequency', 'partial_number'
    """
    try:
        audio_array = np.array(data['audio'], dtype=np.float32)
        frequency = data['frequency']
        partial_number = data.get('partial_number', 2)
        
        partial_freq = frequency * partial_number
        
        result = beat_analyzer.analyze_beats(audio_array, partial_freq, bandwidth=10)
        
        if result:
            beat_freq, beat_mag = beat_analyzer.get_beat_spectrum(result['envelope'])
            
            emit('beat_analysis_result', {
                'beat_frequency': float(result['beat_frequency']),
                'beat_spectrum': {
                    'frequencies': beat_freq.tolist(),
                    'magnitudes': beat_mag.tolist()
                }
            })
        
    except Exception as e:
        print(f"Error analyzing beats: {e}")
        emit('error', {'message': str(e)})


@app.route('/api/calibration/status')
def calibration_status():
    """Retourne l'état de la calibration"""
    return jsonify({
        'has_calibration': calibration_manager.has_calibration(),
        'is_calibrating': calibration_manager.is_calibrating,
        'summary': calibration_manager.get_calibration_summary()
    })


if __name__ == '__main__':
    # Créer les dossiers nécessaires
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    print("=" * 70)
    print("  Piano Tuner Pro - Web Server")
    print("  Accessible depuis iPhone/mobile")
    print("=" * 70)
    print("")
    print(f"  Sample Rate: {SAMPLE_RATE} Hz")
    print(f"  Buffer Size: {BUFFER_SIZE}")
    print(f"  Calibration: {'✓ Loaded' if calibration_manager.has_calibration() else 'None'}")
    print("")
    print("  Server starting...")
    print("  Access from iPhone: http://<YOUR_IP>:5000")
    print("")
    print("  Pour trouver votre IP:")
    print("    Windows: ipconfig")
    print("    macOS/Linux: ifconfig ou ip addr")
    print("")
    print("=" * 70)
    
    # Lancer le serveur
    # host='0.0.0.0' permet l'accès depuis d'autres appareils sur le réseau
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
