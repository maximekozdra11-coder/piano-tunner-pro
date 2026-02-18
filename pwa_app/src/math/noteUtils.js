/**
 * Note Utilities
 * MIDI ↔ frequency ↔ note name conversions and cents calculations
 */

export class NoteUtils {
  static referenceA4 = 440.0; // Hz
  static midiA4 = 69;
  
  static noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static noteNamesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  /**
   * Convert MIDI note number to frequency (Hz)
   */
  static midiToFrequency(midiNote, referenceA4 = this.referenceA4) {
    return referenceA4 * Math.pow(2, (midiNote - this.midiA4) / 12);
  }
  
  /**
   * Convert frequency (Hz) to MIDI note number (fractional)
   */
  static frequencyToMidi(frequency, referenceA4 = this.referenceA4) {
    return this.midiA4 + 12 * Math.log2(frequency / referenceA4);
  }
  
  /**
   * Convert MIDI note to note name with octave
   */
  static midiToNoteName(midiNote, useFlats = false) {
    const names = useFlats ? this.noteNamesFlat : this.noteNames;
    const octave = Math.floor((midiNote - 12) / 12);
    const noteIndex = midiNote % 12;
    return names[noteIndex] + octave;
  }
  
  /**
   * Convert note name to MIDI number
   */
  static noteNameToMidi(noteName) {
    const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    const match = noteName.match(/^([A-G])(#|b)?(-?\d+)$/);
    
    if (!match) return null;
    
    const [, note, accidental, octave] = match;
    const baseNote = noteMap[note];
    let offset = 0;
    
    if (accidental === '#') offset = 1;
    else if (accidental === 'b') offset = -1;
    
    const oct = parseInt(octave);
    return (oct + 1) * 12 + baseNote + offset;
  }
  
  /**
   * Calculate cents deviation between two frequencies
   * Positive = f1 is higher than f2
   */
  static frequencyToCents(f1, f2) {
    if (f2 <= 0 || f1 <= 0) return 0;
    return 1200 * Math.log2(f1 / f2);
  }
  
  /**
   * Apply cents offset to a frequency
   */
  static applyCentsOffset(frequency, cents) {
    return frequency * Math.pow(2, cents / 1200);
  }
  
  /**
   * Find closest MIDI note to a frequency
   */
  static findClosestMidiNote(frequency) {
    const midiFloat = this.frequencyToMidi(frequency);
    return Math.round(midiFloat);
  }
  
  /**
   * Calculate cents deviation from nearest equal temperament note
   */
  static centsFromEqualTemp(frequency) {
    const midiFloat = this.frequencyToMidi(frequency);
    const nearestMidi = Math.round(midiFloat);
    const nearestFreq = this.midiToFrequency(nearestMidi);
    return this.frequencyToCents(frequency, nearestFreq);
  }
  
  /**
   * Check if frequency is within piano range
   */
  static isInPianoRange(frequency) {
    const A0 = 27.5; // Hz
    const C8 = 4186; // Hz
    return frequency >= A0 && frequency <= C8;
  }
  
  /**
   * Get MIDI range for standard 88-key piano
   */
  static getPianoMidiRange() {
    return {
      lowest: 21, // A0
      highest: 108, // C8
      count: 88
    };
  }
  
  /**
   * Format frequency for display
   */
  static formatFrequency(frequency, decimals = 2) {
    return frequency.toFixed(decimals) + ' Hz';
  }
  
  /**
   * Format cents for display with sign
   */
  static formatCents(cents, decimals = 1) {
    const sign = cents >= 0 ? '+' : '';
    return sign + cents.toFixed(decimals) + '¢';
  }
  
  /**
   * Get note color (for UI)
   * Returns 'white' or 'black' for keyboard visualization
   */
  static getNoteColor(midiNote) {
    const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
    const noteIndex = midiNote % 12;
    return blackKeys.includes(noteIndex) ? 'black' : 'white';
  }
  
  /**
   * Get all white keys in range
   */
  static getWhiteKeys(startMidi, endMidi) {
    const whiteKeys = [];
    for (let midi = startMidi; midi <= endMidi; midi++) {
      if (this.getNoteColor(midi) === 'white') {
        whiteKeys.push(midi);
      }
    }
    return whiteKeys;
  }
  
  /**
   * Calculate interval in semitones between two MIDI notes
   */
  static intervalInSemitones(midi1, midi2) {
    return Math.abs(midi2 - midi1);
  }
  
  /**
   * Get interval name
   */
  static getIntervalName(semitones) {
    const intervals = {
      0: 'Unison',
      1: 'Minor second',
      2: 'Major second',
      3: 'Minor third',
      4: 'Major third',
      5: 'Perfect fourth',
      6: 'Tritone',
      7: 'Perfect fifth',
      8: 'Minor sixth',
      9: 'Major sixth',
      10: 'Minor seventh',
      11: 'Major seventh',
      12: 'Octave'
    };
    
    const octaves = Math.floor(semitones / 12);
    const remainder = semitones % 12;
    
    let name = intervals[remainder] || 'Unknown';
    if (octaves > 0) {
      name += ` + ${octaves} octave${octaves > 1 ? 's' : ''}`;
    }
    
    return name;
  }
  
  /**
   * Reference notes for inharmonicity measurement (A0 to A7)
   */
  static getReferenceNotes() {
    return [
      { midi: 21, name: 'A0', frequency: 27.5 },
      { midi: 33, name: 'A1', frequency: 55.0 },
      { midi: 45, name: 'A2', frequency: 110.0 },
      { midi: 57, name: 'A3', frequency: 220.0 },
      { midi: 69, name: 'A4', frequency: 440.0 },
      { midi: 81, name: 'A5', frequency: 880.0 },
      { midi: 93, name: 'A6', frequency: 1760.0 },
      { midi: 105, name: 'A7', frequency: 3520.0 }
    ];
  }
  
  /**
   * Get temperament octave notes (typically A3 to A4)
   */
  static getTemperamentOctaveNotes() {
    const notes = [];
    for (let midi = 57; midi <= 69; midi++) {
      notes.push({
        midi,
        name: this.midiToNoteName(midi),
        frequency: this.midiToFrequency(midi)
      });
    }
    return notes;
  }
}
