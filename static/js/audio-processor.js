/**
 * Audio Processor - Capture audio depuis le microphone de l'iPhone
 * Utilise Web Audio API compatible Safari iOS
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.analyser = null;
        this.processor = null;
        this.isRecording = false;
        this.sampleRate = 44100;
        this.bufferSize = 8192;
        this.audioBuffer = [];
        this.onAudioData = null; // Callback pour les données audio
    }

    /**
     * Initialise le contexte audio et demande l'accès au microphone
     */
    async initialize() {
        try {
            // Créer le contexte audio (compatible Safari iOS)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({
                sampleRate: this.sampleRate
            });

            console.log(`Audio context created: ${this.audioContext.sampleRate} Hz`);

            // Demander l'accès au microphone
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: this.sampleRate
                }
            });

            console.log('Microphone access granted');

            // Créer le graphe audio
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            // Utiliser ScriptProcessor (compatible iOS)
            // Note: ScriptProcessor est deprecated mais fonctionne sur iOS
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            // Connecter le graphe
            source.connect(this.analyser);
            this.analyser.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            // Traiter les données audio
            this.processor.onaudioprocess = (e) => {
                if (!this.isRecording) return;

                const inputData = e.inputBuffer.getChannelData(0);
                
                // Ajouter au buffer
                this.audioBuffer.push(...inputData);

                // Garder seulement bufferSize échantillons
                if (this.audioBuffer.length > this.bufferSize) {
                    this.audioBuffer = this.audioBuffer.slice(-this.bufferSize);
                }

                // Envoyer les données si callback défini
                if (this.onAudioData && this.audioBuffer.length >= 4096) {
                    this.onAudioData(Array.from(this.audioBuffer));
                }
            };

            return true;

        } catch (error) {
            console.error('Error initializing audio:', error);
            throw error;
        }
    }

    /**
     * Démarre l'enregistrement audio
     */
    start() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isRecording = true;
        this.audioBuffer = [];
        console.log('Audio recording started');
    }

    /**
     * Arrête l'enregistrement audio
     */
    stop() {
        this.isRecording = false;
        this.audioBuffer = [];
        console.log('Audio recording stopped');
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        this.stop();

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        console.log('Audio resources cleaned up');
    }

    /**
     * Obtient l'analyseur pour visualisation
     */
    getAnalyser() {
        return this.analyser;
    }

    /**
     * Obtient le taux d'échantillonnage réel
     */
    getSampleRate() {
        return this.audioContext ? this.audioContext.sampleRate : this.sampleRate;
    }
}

// Export pour utilisation
window.AudioProcessor = AudioProcessor;
