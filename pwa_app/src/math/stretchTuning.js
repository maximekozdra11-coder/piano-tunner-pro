/**
 * Stretch Tuning Generator
 * Generates Railsback-style stretch tuning curve from measured inharmonicity
 * Uses cubic spline interpolation for smooth curve
 */

export class StretchTuningGenerator {
  constructor() {
    this.referenceA4 = 440.0; // Hz
    this.midiA4 = 69;
    this.numKeys = 88; // Standard piano
    this.lowestKey = 21; // A0
  }
  
  /**
   * Generate complete 88-key stretch curve from measurement points
   * measurements: Array of { midiNote, B, f0, confidence }
   * Returns: Array of { midiNote, frequency, stretchCents, confidence }
   */
  generateStretchCurve(measurements, temperament = '12-TET') {
    if (measurements.length < 2) {
      throw new Error('Need at least 2 measurement points');
    }
    
    // Sort measurements by MIDI note
    const sorted = [...measurements].sort((a, b) => a.midiNote - b.midiNote);
    
    // Interpolate B coefficients for all 88 keys
    const BValues = this.interpolateBCoefficients(sorted);
    
    // Calculate target frequencies for each key
    const tuningCurve = [];
    
    for (let midi = this.lowestKey; midi < this.lowestKey + this.numKeys; midi++) {
      const B = BValues[midi - this.lowestKey];
      const result = this.calculateTargetFrequency(midi, B, temperament);
      
      tuningCurve.push({
        midiNote: midi,
        noteName: this.midiToNoteName(midi),
        frequency: result.frequency,
        stretchCents: result.stretchCents,
        B: B,
        equalTempFreq: result.equalTempFreq
      });
    }
    
    return tuningCurve;
  }
  
  /**
   * Interpolate B coefficients for all 88 keys using cubic spline
   */
  interpolateBCoefficients(measurements) {
    const BValues = new Array(this.numKeys);
    
    if (measurements.length === 2) {
      // Linear interpolation for 2 points
      return this.linearInterpolation(measurements);
    } else if (measurements.length === 3) {
      // Quadratic interpolation for 3 points
      return this.quadraticInterpolation(measurements);
    } else {
      // Cubic spline for 4+ points
      return this.cubicSplineInterpolation(measurements);
    }
  }
  
  /**
   * Linear interpolation (2 points)
   */
  linearInterpolation(measurements) {
    const BValues = new Array(this.numKeys);
    const [p1, p2] = measurements;
    
    for (let i = 0; i < this.numKeys; i++) {
      const midi = this.lowestKey + i;
      
      if (midi <= p1.midiNote) {
        BValues[i] = p1.B;
      } else if (midi >= p2.midiNote) {
        BValues[i] = p2.B;
      } else {
        const t = (midi - p1.midiNote) / (p2.midiNote - p1.midiNote);
        BValues[i] = p1.B + t * (p2.B - p1.B);
      }
    }
    
    return BValues;
  }
  
  /**
   * Quadratic interpolation (3 points)
   */
  quadraticInterpolation(measurements) {
    const BValues = new Array(this.numKeys);
    const [p1, p2, p3] = measurements;
    
    // Fit quadratic: B = a*x² + b*x + c
    const x1 = p1.midiNote, x2 = p2.midiNote, x3 = p3.midiNote;
    const y1 = p1.B, y2 = p2.B, y3 = p3.B;
    
    const denom = (x1 - x2) * (x1 - x3) * (x2 - x3);
    const a = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / denom;
    const b = (x3*x3 * (y1 - y2) + x2*x2 * (y3 - y1) + x1*x1 * (y2 - y3)) / denom;
    const c = (x2 * x3 * (x2 - x3) * y1 + x3 * x1 * (x3 - x1) * y2 + x1 * x2 * (x1 - x2) * y3) / denom;
    
    for (let i = 0; i < this.numKeys; i++) {
      const midi = this.lowestKey + i;
      BValues[i] = Math.max(0, a * midi * midi + b * midi + c);
    }
    
    return BValues;
  }
  
  /**
   * Cubic spline interpolation (4+ points)
   */
  cubicSplineInterpolation(measurements) {
    const n = measurements.length;
    const x = measurements.map(m => m.midiNote);
    const y = measurements.map(m => m.B);
    
    // Calculate spline coefficients
    const h = new Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
      h[i] = x[i + 1] - x[i];
    }
    
    // Solve tridiagonal system for second derivatives
    const alpha = new Array(n - 1);
    for (let i = 1; i < n - 1; i++) {
      alpha[i] = (3 / h[i]) * (y[i + 1] - y[i]) - (3 / h[i - 1]) * (y[i] - y[i - 1]);
    }
    
    const l = new Array(n);
    const mu = new Array(n);
    const z = new Array(n);
    
    l[0] = 1;
    mu[0] = 0;
    z[0] = 0;
    
    for (let i = 1; i < n - 1; i++) {
      l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }
    
    l[n - 1] = 1;
    z[n - 1] = 0;
    
    const c = new Array(n);
    c[n - 1] = 0;
    
    for (let j = n - 2; j >= 0; j--) {
      c[j] = z[j] - mu[j] * c[j + 1];
    }
    
    const b = new Array(n - 1);
    const d = new Array(n - 1);
    
    for (let i = 0; i < n - 1; i++) {
      b[i] = (y[i + 1] - y[i]) / h[i] - h[i] * (c[i + 1] + 2 * c[i]) / 3;
      d[i] = (c[i + 1] - c[i]) / (3 * h[i]);
    }
    
    // Evaluate spline for all keys
    const BValues = new Array(this.numKeys);
    
    for (let i = 0; i < this.numKeys; i++) {
      const midi = this.lowestKey + i;
      
      // Find interval
      let j = 0;
      for (j = 0; j < n - 1; j++) {
        if (midi <= x[j + 1]) break;
      }
      j = Math.min(j, n - 2);
      
      // Evaluate cubic polynomial
      const dx = midi - x[j];
      BValues[i] = Math.max(0, y[j] + b[j] * dx + c[j] * dx * dx + d[j] * dx * dx * dx);
    }
    
    return BValues;
  }
  
  /**
   * Calculate target frequency for a given MIDI note with inharmonicity
   */
  calculateTargetFrequency(midiNote, B, temperament = '12-TET') {
    // Equal temperament frequency
    const equalTempFreq = this.midiToFrequency(midiNote);
    
    // Calculate stretch offset based on inharmonicity
    // The stretch compensates for inharmonicity to maintain octave purity
    const stretchCents = this.calculateStretchOffset(midiNote, B);
    
    // Apply stretch
    const targetFreq = equalTempFreq * Math.pow(2, stretchCents / 1200);
    
    return {
      frequency: targetFreq,
      equalTempFreq,
      stretchCents
    };
  }
  
  /**
   * Calculate stretch offset in cents for Railsback curve
   */
  calculateStretchOffset(midiNote, B) {
    // Distance from A4 in semitones
    const distanceFromA4 = midiNote - this.midiA4;
    
    // Stretch is larger for notes far from middle C
    // This creates the characteristic Railsback curve shape
    
    // For octaves: we want 2nd partial of lower note = fundamental of upper
    // This gives: stretch ≈ 600 * B * n² / ln(2) where n is the relevant partial
    
    // Simplified model: stretch increases quadratically with distance from center
    const basalStretch = 600 * B * 4 / Math.log(2); // For n=2 (octave)
    
    // Scale by distance from center (A4)
    // Bass: negative offset (lower)
    // Treble: positive offset (higher)
    const scaleFactor = distanceFromA4 / 24; // Normalize to ±2 octaves
    
    return basalStretch * scaleFactor;
  }
  
  /**
   * MIDI to frequency (equal temperament)
   */
  midiToFrequency(midiNote) {
    return this.referenceA4 * Math.pow(2, (midiNote - this.midiA4) / 12);
  }
  
  /**
   * Frequency to MIDI (equal temperament)
   */
  frequencyToMidi(frequency) {
    return this.midiA4 + 12 * Math.log2(frequency / this.referenceA4);
  }
  
  /**
   * MIDI to note name
   */
  midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor((midiNote - 12) / 12);
    const noteIndex = midiNote % 12;
    return noteNames[noteIndex] + octave;
  }
  
  /**
   * Note name to MIDI
   */
  noteNameToMidi(noteName) {
    const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    const match = noteName.match(/^([A-G])(#?)(-?\d+)$/);
    
    if (!match) return null;
    
    const [, note, sharp, octave] = match;
    const baseNote = noteMap[note];
    const sharpOffset = sharp === '#' ? 1 : 0;
    const oct = parseInt(octave);
    
    return (oct + 1) * 12 + baseNote + sharpOffset;
  }
  
  /**
   * Calculate cents deviation between two frequencies
   */
  frequencyToCents(f1, f2) {
    return 1200 * Math.log2(f1 / f2);
  }
}
