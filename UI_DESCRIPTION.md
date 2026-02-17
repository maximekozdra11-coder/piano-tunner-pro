# Piano Tuner Pro - User Interface Description

## Main Window Layout

```
┌────────────────────────────────────────────────────────────┐
│  Piano Tuner Pro                                      [_][□][X]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─ Accordage ────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  Cents Meter (±50 cents):                           │  │
│  │  ╔══════════════════════════════════════════════╗  │  │
│  │  ║  -50    -25      0      25     50            ║  │  │
│  │  ║   │      │       ▲       │      │             ║  │
│  │  ║   │      │      ┃┃┃      │      │             ║  │
│  │  ║   │      │      ●       │      │             ║  │
│  │  ╚══════════════════════════════════════════════╝  │  │
│  │                                                      │  │
│  │  Fréquence mesurée: 440.00 Hz                       │  │
│  │  Fréquence cible:   440.02 Hz                       │  │
│  │                                                      │  │
│  │            Écart: +0.5 cents                         │  │
│  │                                                      │  │
│  │            Note: A4                                  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ Spectre en temps réel ─────────────────────────────┐  │
│  │  Magnitude (dB)                                      │  │
│  │   0 ┤                                                │  │
│  │     │      ▲                                         │  │
│  │ -20 ┤     ╱│╲        ▲                              │  │
│  │     │    ╱ │ ╲      ╱│╲                             │  │
│  │ -40 ┤___╱__│__╲____╱_│_╲___________________________│  │
│  │     │      │         │                              │  │
│  │ -60 ┤─────────────────────────────────────────────  │  │
│  │     0    500   1000  1500  2000 Hz                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌───────────────────────────────────────────────────┐   │
│  │ [Démarrer] [Arrêter] [Analyse des battements]     │   │
│  └───────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─ Calibration ─────────────────────────────────────┐   │
│  │ [Démarrer calibration] [Arrêter calibration]      │   │
│  │ [Sauvegarder profil]  Calibré: 8 notes            │   │
│  └───────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Beat Analysis Dialog

```
┌──────────────────────────────────────────────┐
│  Analyse des battements              [_][□][X]│
├──────────────────────────────────────────────┤
│                                              │
│  Partiel à analyser (k): [2 ▼]              │
│                                              │
│  Fréquence de battement: 2.15 Hz            │
│                                              │
│  ┌─ Enveloppe du signal filtré ──────────┐ │
│  │ Amplitude                              │ │
│  │  1.0 ┤  ╱╲    ╱╲    ╱╲    ╱╲          │ │
│  │      │ ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲         │ │
│  │  0.5 ┤      ╲╱    ╲╱    ╲╱    ╲        │ │
│  │      │                                 │ │
│  │  0.0 ┤─────────────────────────────────│ │
│  │      0    0.5   1.0   1.5   2.0 s     │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌─ Spectre de l'enveloppe (battements) ─┐ │
│  │ Magnitude                              │ │
│  │ 100 ┤                                  │ │
│  │     │      ▲                           │ │
│  │  50 ┤     ╱│╲                          │ │
│  │     │____╱_│_╲_____________________    │ │
│  │   0 ┤      │                           │ │
│  │     0     5    10    15    20 Hz      │ │
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

## Color Coding

### Cents Meter Needle
- 🟢 **Green**: Deviation < 5 cents (well tuned)
- 🟠 **Orange**: Deviation < 15 cents (close, needs minor adjustment)
- 🔴 **Red**: Deviation ≥ 15 cents (needs adjustment)

### Visual Indicators
- The needle moves horizontally based on cents deviation
- A circle at the needle tip makes it more visible
- Graduations at -50, -25, 0, +25, +50 cents
- Center line (0) highlighted in green

## Interaction Flow

### Starting a Tuning Session
1. User clicks **"Démarrer"** button
2. Application starts audio capture
3. Button becomes disabled, **"Arrêter"** button becomes enabled
4. User plays a note on the piano
5. UI updates in real-time (20 FPS):
   - Cents meter moves to show deviation
   - Frequencies displayed
   - Note name shown
   - Spectrum graph updates

### Calibrating the Piano
1. User clicks **"Démarrer calibration"**
2. Status shows "Calibration en cours..."
3. User plays multiple notes (e.g., A0, A1, A2, etc.)
4. After each stable note, user clicks **"Sauvegarder profil"**
5. Status updates: "Calibré: N notes"
6. User clicks **"Arrêter calibration"** when done
7. Calibration profile saved to JSON
8. Profile automatically loaded on next startup

### Analyzing Beats
1. User clicks **"Analyse des battements"**
2. Dialog window opens
3. User selects partial rank (1-10) using spinbox
4. User plays a note
5. Dialog shows:
   - Filtered signal envelope (time domain)
   - FFT of envelope (frequency domain)
   - Detected beat frequency in Hz
6. Useful for fine-tuning intervals and detecting interference

## Responsive Design
- Window resizes smoothly
- Graphs maintain aspect ratio
- Buttons properly aligned
- Font sizes appropriate for readability
- No UI freezing during computation (async operations)

## User Feedback
- Console messages for important events
- Status labels update in real-time
- Color-coded visual indicators
- Disabled buttons prevent invalid actions
- Error messages displayed when microphone unavailable

