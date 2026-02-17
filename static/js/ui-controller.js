/**
 * UI Controller - Gère l'affichage et les interactions
 */

class UIController {
    constructor() {
        this.centsMeterCanvas = document.getElementById('cents-meter');
        this.centsMeterCtx = this.centsMeterCanvas.getContext('2d');
        this.spectrumCanvas = document.getElementById('spectrum-canvas');
        this.spectrumCtx = this.spectrumCanvas.getContext('2d');
        
        this.currentCents = 0;
        this.currentNote = '--';
        
        // Ajuster la taille des canvas pour les écrans haute résolution
        this.setupCanvas();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        
        // Cents meter
        const cmRect = this.centsMeterCanvas.getBoundingClientRect();
        this.centsMeterCanvas.width = cmRect.width * dpr;
        this.centsMeterCanvas.height = cmRect.height * dpr;
        this.centsMeterCtx.scale(dpr, dpr);
        
        // Spectrum
        const spRect = this.spectrumCanvas.getBoundingClientRect();
        this.spectrumCanvas.width = spRect.width * dpr;
        this.spectrumCanvas.height = spRect.height * dpr;
        this.spectrumCtx.scale(dpr, dpr);
    }

    /**
     * Dessine le curseur de cents (±50 cents)
     */
    drawCentsMeter(cents) {
        const ctx = this.centsMeterCtx;
        const canvas = this.centsMeterCanvas;
        const width = canvas.getBoundingClientRect().width;
        const height = canvas.getBoundingClientRect().height;
        
        // Limiter les cents à ±50
        cents = Math.max(-50, Math.min(50, cents));
        this.currentCents = cents;
        
        // Effacer
        ctx.clearRect(0, 0, width, height);
        
        // Couleur de fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const meterWidth = width - 60;
        const startX = 30;
        
        // Ligne de base
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        ctx.lineTo(startX + meterWidth, centerY);
        ctx.stroke();
        
        // Graduations
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        
        for (let c = -50; c <= 50; c += 25) {
            const x = centerX + (c / 50) * (meterWidth / 2);
            ctx.beginPath();
            ctx.moveTo(x, centerY - 10);
            ctx.lineTo(x, centerY + 10);
            ctx.stroke();
            
            ctx.fillText(c > 0 ? `+${c}` : c, x, centerY + 28);
        }
        
        // Ligne centrale (0)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 15);
        ctx.lineTo(centerX, centerY + 15);
        ctx.stroke();
        
        // Aiguille
        const needleX = centerX + (cents / 50) * (meterWidth / 2);
        
        // Couleur de l'aiguille selon l'écart
        let needleColor;
        if (Math.abs(cents) < 5) {
            needleColor = '#10b981'; // Vert
        } else if (Math.abs(cents) < 15) {
            needleColor = '#f59e0b'; // Orange
        } else {
            needleColor = '#ef4444'; // Rouge
        }
        
        ctx.strokeStyle = needleColor;
        ctx.fillStyle = needleColor;
        ctx.lineWidth = 3;
        
        // Ligne de l'aiguille
        ctx.beginPath();
        ctx.moveTo(needleX, centerY - 25);
        ctx.lineTo(needleX, centerY + 25);
        ctx.stroke();
        
        // Cercle au bout
        ctx.beginPath();
        ctx.arc(needleX, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Mise à jour de la classe CSS
        const centsValueEl = document.getElementById('cents-value');
        centsValueEl.classList.remove('perfect', 'close', 'far');
        if (Math.abs(cents) < 5) {
            centsValueEl.classList.add('perfect');
        } else if (Math.abs(cents) < 15) {
            centsValueEl.classList.add('close');
        } else {
            centsValueEl.classList.add('far');
        }
    }

    /**
     * Dessine le spectre de fréquences
     */
    drawSpectrum(frequencies, magnitudes) {
        const ctx = this.spectrumCtx;
        const canvas = this.spectrumCanvas;
        const width = canvas.getBoundingClientRect().width;
        const height = canvas.getBoundingClientRect().height;
        
        // Effacer
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        if (!frequencies || frequencies.length === 0) return;
        
        // Normaliser les magnitudes
        const maxMag = Math.max(...magnitudes.filter(m => m > -100));
        const minMag = Math.min(...magnitudes);
        
        // Dessiner le spectre
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < frequencies.length; i++) {
            const x = (i / frequencies.length) * width;
            const normalized = (magnitudes[i] - minMag) / (maxMag - minMag);
            const y = height - (normalized * height * 0.8) - 10;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Grille
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        
        // Lignes horizontales
        for (let i = 0; i < 4; i++) {
            const y = (i / 3) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    /**
     * Met à jour l'affichage de la note
     */
    updateNote(note) {
        if (!note) {
            document.getElementById('note-name').textContent = '--';
            document.getElementById('note-octave').textContent = '';
            return;
        }
        
        this.currentNote = note;
        
        // Séparer la note et l'octave (ex: "A4" -> "A" et "4")
        const match = note.match(/^([A-G]#?)(\d+)$/);
        if (match) {
            document.getElementById('note-name').textContent = match[1];
            document.getElementById('note-octave').textContent = `Octave ${match[2]}`;
        } else {
            document.getElementById('note-name').textContent = note;
            document.getElementById('note-octave').textContent = '';
        }
    }

    /**
     * Met à jour l'affichage des fréquences
     */
    updateFrequencies(measured, target) {
        document.getElementById('freq-measured').textContent = 
            measured ? `${measured.toFixed(2)} Hz` : '-- Hz';
        document.getElementById('freq-target').textContent = 
            target ? `${target.toFixed(2)} Hz` : '-- Hz';
    }

    /**
     * Met à jour l'affichage des cents
     */
    updateCents(cents) {
        document.getElementById('cents-value').textContent = 
            cents !== null ? `${cents > 0 ? '+' : ''}${cents.toFixed(1)} cents` : '-- cents';
        
        if (cents !== null) {
            this.drawCentsMeter(cents);
        }
    }

    /**
     * Met à jour le statut de connexion
     */
    updateConnectionStatus(connected, message) {
        const statusEl = document.getElementById('status');
        const statusTextEl = document.getElementById('status-text');
        
        if (connected) {
            statusEl.classList.add('connected');
            statusTextEl.textContent = message || 'Connecté';
        } else {
            statusEl.classList.remove('connected');
            statusTextEl.textContent = message || 'Déconnecté';
        }
    }

    /**
     * Met à jour le statut de calibration
     */
    updateCalibrationStatus(message) {
        document.getElementById('calib-status').textContent = message;
    }

    /**
     * Met à jour le résultat d'analyse des battements
     */
    updateBeatResult(frequency) {
        const resultEl = document.getElementById('beat-result');
        if (frequency !== null && frequency !== undefined) {
            resultEl.textContent = `Fréquence de battement: ${frequency.toFixed(2)} Hz`;
        } else {
            resultEl.textContent = 'Aucune analyse';
        }
    }

    /**
     * Affiche un message d'erreur
     */
    showError(message) {
        alert(`Erreur: ${message}`);
    }
}

// Export
window.UIController = UIController;
