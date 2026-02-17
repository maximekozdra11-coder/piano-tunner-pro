/**
 * Piano Tuner Pro - Application principale
 * Orchestre l'audio, l'UI et la communication avec le serveur
 */

class PianoTunerApp {
    constructor() {
        this.audioProcessor = null;
        this.uiController = new UIController();
        this.socket = null;
        this.isRunning = false;
        this.isCalibrating = false;
        this.lastAudioData = null;
        this.currentFrequency = null;
        this.currentMidi = null;
        
        this.init();
    }

    /**
     * Initialise l'application
     */
    async init() {
        console.log('Piano Tuner Pro - Initializing...');
        
        // Connecter au serveur WebSocket
        this.connectSocket();
        
        // Configurer les événements des boutons
        this.setupEventListeners();
        
        console.log('Initialization complete');
    }

    /**
     * Connecte au serveur via WebSocket
     */
    connectSocket() {
        // Socket.IO
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.uiController.updateConnectionStatus(true, 'Connecté au serveur');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.uiController.updateConnectionStatus(false, 'Déconnecté');
        });
        
        this.socket.on('status', (data) => {
            console.log('Status:', data.message);
        });
        
        this.socket.on('analysis_result', (data) => {
            this.handleAnalysisResult(data);
        });
        
        this.socket.on('calibration_status', (data) => {
            this.handleCalibrationStatus(data);
        });
        
        this.socket.on('calibration_saved', (data) => {
            console.log('Calibration saved:', data);
            this.uiController.updateCalibrationStatus(data.message);
        });
        
        this.socket.on('beat_analysis_result', (data) => {
            this.handleBeatResult(data);
        });
        
        this.socket.on('error', (data) => {
            console.error('Server error:', data);
            this.uiController.showError(data.message);
        });
    }

    /**
     * Configure les événements des boutons
     */
    setupEventListeners() {
        // Bouton Démarrer
        document.getElementById('start-btn').addEventListener('click', async () => {
            await this.start();
        });
        
        // Bouton Arrêter
        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stop();
        });
        
        // Calibration
        document.getElementById('calib-start-btn').addEventListener('click', () => {
            this.startCalibration();
        });
        
        document.getElementById('calib-stop-btn').addEventListener('click', () => {
            this.stopCalibration();
        });
        
        document.getElementById('calib-save-btn').addEventListener('click', () => {
            this.saveCalibration();
        });
        
        // Analyse des battements
        document.getElementById('analyze-beats-btn').addEventListener('click', () => {
            this.analyzeBeats();
        });
    }

    /**
     * Démarre l'accordage
     */
    async start() {
        if (this.isRunning) return;
        
        try {
            console.log('Starting tuner...');
            
            // Initialiser l'audio si pas déjà fait
            if (!this.audioProcessor) {
                this.audioProcessor = new AudioProcessor();
                await this.audioProcessor.initialize();
                
                // Définir le callback pour les données audio
                this.audioProcessor.onAudioData = (audioData) => {
                    this.lastAudioData = audioData;
                    this.sendAudioData(audioData);
                };
            }
            
            // Démarrer l'enregistrement
            this.audioProcessor.start();
            this.isRunning = true;
            
            // Mettre à jour l'UI
            document.getElementById('start-btn').style.display = 'none';
            document.getElementById('stop-btn').style.display = 'flex';
            
            this.uiController.updateConnectionStatus(true, 'En cours d\'accordage...');
            
            console.log('Tuner started');
            
        } catch (error) {
            console.error('Error starting tuner:', error);
            alert(`Erreur lors du démarrage: ${error.message}\n\nAssurez-vous d'avoir autorisé l'accès au microphone.`);
        }
    }

    /**
     * Arrête l'accordage
     */
    stop() {
        if (!this.isRunning) return;
        
        console.log('Stopping tuner...');
        
        if (this.audioProcessor) {
            this.audioProcessor.stop();
        }
        
        this.isRunning = false;
        
        // Mettre à jour l'UI
        document.getElementById('start-btn').style.display = 'flex';
        document.getElementById('stop-btn').style.display = 'none';
        
        this.uiController.updateConnectionStatus(true, 'Arrêté');
        
        console.log('Tuner stopped');
    }

    /**
     * Envoie les données audio au serveur
     */
    sendAudioData(audioData) {
        if (!this.socket || !this.socket.connected) return;
        
        // Envoyer via WebSocket
        this.socket.emit('audio_data', {
            audio: audioData,
            sample_rate: this.audioProcessor.getSampleRate()
        });
    }

    /**
     * Traite le résultat de l'analyse
     */
    handleAnalysisResult(data) {
        // Mettre à jour l'affichage
        this.uiController.updateNote(data.note);
        this.uiController.updateFrequencies(data.frequency, data.target_frequency);
        this.uiController.updateCents(data.cents);
        
        // Mettre à jour le spectre
        if (data.spectrum) {
            this.uiController.drawSpectrum(
                data.spectrum.frequencies,
                data.spectrum.magnitudes
            );
        }
        
        // Sauvegarder pour calibration
        this.currentFrequency = data.frequency;
        this.currentMidi = data.midi;
    }

    /**
     * Démarre la calibration
     */
    startCalibration() {
        if (this.isCalibrating) return;
        
        console.log('Starting calibration...');
        this.socket.emit('start_calibration');
        this.isCalibrating = true;
        
        // Mettre à jour l'UI
        document.getElementById('calib-start-btn').style.display = 'none';
        document.getElementById('calib-stop-btn').style.display = 'block';
        document.getElementById('calib-save-btn').style.display = 'block';
        
        this.uiController.updateCalibrationStatus('Calibration en cours... Jouez des notes et cliquez sur "Sauvegarder note"');
    }

    /**
     * Arrête la calibration
     */
    stopCalibration() {
        if (!this.isCalibrating) return;
        
        console.log('Stopping calibration...');
        this.socket.emit('stop_calibration');
        this.isCalibrating = false;
        
        // Mettre à jour l'UI
        document.getElementById('calib-start-btn').style.display = 'block';
        document.getElementById('calib-stop-btn').style.display = 'none';
        document.getElementById('calib-save-btn').style.display = 'none';
    }

    /**
     * Sauvegarde une mesure de calibration
     */
    saveCalibration() {
        if (!this.isCalibrating || !this.currentFrequency || !this.currentMidi) {
            alert('Jouez une note stable avant de sauvegarder');
            return;
        }
        
        console.log('Saving calibration point...');
        this.socket.emit('save_calibration', {
            midi_note: this.currentMidi,
            frequency: this.currentFrequency,
            B: 0.0001  // Valeur par défaut, sera calculée côté serveur
        });
    }

    /**
     * Traite le statut de calibration
     */
    handleCalibrationStatus(data) {
        console.log('Calibration status:', data);
        this.uiController.updateCalibrationStatus(data.message);
    }

    /**
     * Analyse les battements
     */
    analyzeBeats() {
        if (!this.lastAudioData || !this.currentFrequency) {
            alert('Jouez une note avant d\'analyser les battements');
            return;
        }
        
        const partialNumber = parseInt(document.getElementById('partial-select').value);
        
        console.log(`Analyzing beats for partial ${partialNumber}...`);
        
        this.socket.emit('analyze_beats', {
            audio: this.lastAudioData,
            frequency: this.currentFrequency,
            partial_number: partialNumber
        });
    }

    /**
     * Traite le résultat d'analyse des battements
     */
    handleBeatResult(data) {
        console.log('Beat result:', data);
        this.uiController.updateBeatResult(data.beat_frequency);
    }
}

// Démarrer l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, starting app...');
    window.app = new PianoTunerApp();
});
