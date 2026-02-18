/**
 * Main App Controller
 * Manages UI screens and app navigation
 */

import { noteToMidi, midiToNoteName, frequencyToMidi, midiToFrequency, centsDeviation } from '../math/noteUtils.js';
import { calculateInharmonicity } from '../math/inharmonicity.js';
import { generateStretchCurve } from '../math/stretchTuning.js';

export class App {
  constructor(audioEngine, dataManager) {
    this.audioEngine = audioEngine;
    this.dataManager = dataManager;
    this.currentScreen = 'home';
    this.currentPiano = null;
    this.measurementData = [];
    this.stretchCurve = null;
    
    // Bind methods
    this.showHome = this.showHome.bind(this);
    this.showMeasurement = this.showMeasurement.bind(this);
    this.showTuning = this.showTuning.bind(this);
  }
  
  async init() {
    this.setupUI();
    await this.showHome();
  }
  
  setupUI() {
    const app = document.getElementById('app');
    if (!app) {
      console.error('App container not found');
      return;
    }
    
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>🎹 Piano Tuner Pro</h1>
          <button id="installBtn" class="btn btn-secondary" style="display: none;">
            📱 Installer
          </button>
        </header>
        <main id="mainContent" class="main-content">
          <!-- Dynamic content -->
        </main>
      </div>
    `;
  }
  
  async showHome() {
    this.currentScreen = 'home';
    const main = document.getElementById('mainContent');
    
    // Get saved pianos
    const pianos = await this.dataManager.getPianos();
    
    main.innerHTML = `
      <div class="home-screen">
        <div class="welcome-section">
          <h2>Bienvenue</h2>
          <p>Application professionnelle d'accordage de piano</p>
        </div>
        
        <button class="btn btn-primary btn-large" id="newMeasurementBtn">
          ➕ Nouvelle Mesure Piano
        </button>
        
        <div class="piano-list">
          <h3>Mes Pianos</h3>
          ${pianos.length === 0 ? 
            '<p class="empty-message">Aucun piano enregistré. Commencez par une nouvelle mesure.</p>' :
            pianos.map(piano => `
              <div class="piano-card" data-id="${piano.id}">
                <div class="piano-info">
                  <h4>${piano.name}</h4>
                  <p>${piano.type === 'grand' ? 'Piano à queue' : 'Piano droit'}</p>
                  <p class="piano-date">Créé le ${new Date(piano.created).toLocaleDateString()}</p>
                </div>
                <div class="piano-actions">
                  <button class="btn btn-primary" data-action="tune" data-id="${piano.id}">
                    🎯 Accorder
                  </button>
                  <button class="btn btn-secondary" data-action="view" data-id="${piano.id}">
                    📊 Voir
                  </button>
                </div>
              </div>
            `).join('')
          }
        </div>
        
        <div class="app-info">
          <h3>📱 Application PWA</h3>
          <p>✅ Fonctionne hors ligne</p>
          <p>✅ Précision &lt; ±0.1 cent</p>
          <p>✅ Mesure d'inarmonicité</p>
          <p>✅ Stretch tuning automatique</p>
        </div>
      </div>
    `;
    
    // Attach event listeners
    document.getElementById('newMeasurementBtn')?.addEventListener('click', this.showMeasurement);
    
    document.querySelectorAll('[data-action="tune"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.id);
        this.currentPiano = await this.dataManager.getPiano(id);
        await this.showTuning();
      });
    });
    
    document.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.id);
        this.currentPiano = await this.dataManager.getPiano(id);
        await this.showPianoProfile();
      });
    });
  }
  
  async showMeasurement() {
    this.currentScreen = 'measurement';
    const main = document.getElementById('mainContent');
    
    main.innerHTML = `
      <div class="measurement-screen">
        <div class="header-with-back">
          <button class="btn btn-secondary" id="backBtn">← Retour</button>
          <h2>Mesure d'Inarmonicité</h2>
        </div>
        
        <div class="measurement-guide">
          <h3>Instructions</h3>
          <p>Jouez les notes suivantes : A0, A1, A2, A3, A4, A5, A6, A7</p>
          <p>L'application analysera l'inarmonicité de votre piano.</p>
        </div>
        
        <div class="measurement-status">
          <div class="current-note">
            <h4>Note à jouer</h4>
            <div class="note-display large">A0</div>
          </div>
          
          <div class="signal-quality">
            <h4>Qualité du signal</h4>
            <div class="quality-bar">
              <div class="quality-fill" style="width: 0%"></div>
            </div>
            <p class="quality-text">En attente...</p>
          </div>
          
          <div class="progress-section">
            <h4>Progression</h4>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%"></div>
            </div>
            <p class="progress-text">0 / 8 notes mesurées</p>
          </div>
        </div>
        
        <div class="measurement-actions">
          <button class="btn btn-primary btn-large" id="startMeasurementBtn">
            🎤 Commencer la Mesure
          </button>
          <button class="btn btn-secondary" id="saveMeasurementBtn" style="display: none;">
            💾 Sauvegarder le Profil
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('backBtn')?.addEventListener('click', this.showHome);
    document.getElementById('startMeasurementBtn')?.addEventListener('click', () => this.startMeasurementProcess());
  }
  
  async startMeasurementProcess() {
    // Initialize audio engine
    const success = await this.audioEngine.init();
    if (!success) {
      alert('Impossible d\'accéder au microphone');
      return;
    }
    
    alert('Mesure démarrée! (Fonctionnalité en cours de développement)\n\nProchainement:\n- Détection automatique des notes\n- Analyse des partiels\n- Calcul de l\'inarmonicité\n- Génération de la courbe de stretch');
  }
  
  async showTuning() {
    if (!this.currentPiano) return;
    
    this.currentScreen = 'tuning';
    const main = document.getElementById('mainContent');
    
    main.innerHTML = `
      <div class="tuning-screen">
        <div class="header-with-back">
          <button class="btn btn-secondary" id="backBtn">← Retour</button>
          <h2>Accordage - ${this.currentPiano.name}</h2>
        </div>
        
        <div class="tuning-display">
          <div class="note-display large">A4</div>
          
          <div class="cents-meter">
            <div class="cents-scale">
              <span>-50</span>
              <span>-25</span>
              <span>0</span>
              <span>+25</span>
              <span>+50</span>
            </div>
            <div class="cents-needle" style="left: 50%"></div>
            <div class="cents-value">+0.0</div>
          </div>
          
          <div class="frequency-display">
            <div class="freq-measured">
              <label>Mesurée</label>
              <span>440.00 Hz</span>
            </div>
            <div class="freq-target">
              <label>Cible</label>
              <span>440.00 Hz</span>
            </div>
          </div>
          
          <div class="signal-quality">
            <div class="quality-indicator">
              <div class="quality-dot"></div>
              <span>Signal: En attente</span>
            </div>
          </div>
        </div>
        
        <div class="tuning-actions">
          <button class="btn btn-primary btn-large" id="startTuningBtn">
            🎤 Démarrer l'Accordage
          </button>
        </div>
        
        <div class="app-info">
          <p>💡 Tournez la cheville jusqu'à ce que le curseur soit au centre</p>
          <p>✅ Validation automatique après 2 secondes de stabilité</p>
        </div>
      </div>
    `;
    
    document.getElementById('backBtn')?.addEventListener('click', this.showHome);
    document.getElementById('startTuningBtn')?.addEventListener('click', () => this.startTuningProcess());
  }
  
  async startTuningProcess() {
    const success = await this.audioEngine.init();
    if (!success) {
      alert('Impossible d\'accéder au microphone');
      return;
    }
    
    alert('Accordage démarré! (Fonctionnalité en cours de développement)\n\nProchainement:\n- Détection temps réel de la fréquence\n- Curseur de cents animé\n- Auto-validation\n- Suggestion de la prochaine note');
  }
  
  async showPianoProfile() {
    if (!this.currentPiano) return;
    
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="profile-screen">
        <div class="header-with-back">
          <button class="btn btn-secondary" id="backBtn">← Retour</button>
          <h2>${this.currentPiano.name}</h2>
        </div>
        
        <div class="profile-info">
          <p><strong>Type:</strong> ${this.currentPiano.type === 'grand' ? 'Piano à queue' : 'Piano droit'}</p>
          <p><strong>Créé:</strong> ${new Date(this.currentPiano.created).toLocaleString()}</p>
        </div>
        
        <div class="app-info">
          <p>📊 Courbe d'inarmonicité (à venir)</p>
          <p>📝 Historique des accordages (à venir)</p>
        </div>
      </div>
    `;
    
    document.getElementById('backBtn')?.addEventListener('click', this.showHome);
  }
  
  showInstallButton(deferredPrompt) {
    const btn = document.getElementById('installBtn');
    if (btn) {
      btn.style.display = 'block';
      btn.addEventListener('click', async () => {
        btn.style.display = 'none';
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
      });
    }
  }
}
