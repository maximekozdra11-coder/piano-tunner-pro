/**
 * Audio Engine Orchestrator
 * Coordinates all audio processing components
 */

import { FFTProcessor } from './fftProcessor.js';
import { PitchDetector } from './pitchDetector.js';
import { PartialAnalyzer } from './partialAnalyzer.js';
import { NoiseFilter } from './noiseFilter.js';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
    this.audioBuffer = new Float32Array(8192);
    this.sampleRate = 44100;
    this.isRunning = false;
    
    // Initialize processors
    this.fftProcessor = new FFTProcessor();
    this.pitchDetector = new PitchDetector(this.sampleRate);
    this.partialAnalyzer = new PartialAnalyzer();
    this.noiseFilter = new NoiseFilter(this.sampleRate);
    
    // Callbacks
    this.onResult = null;
    this.onError = null;
  }
  
  async init() {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: { ideal: 48000 }
        }
      });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000
      });
      this.sampleRate = this.audioContext.sampleRate;
      
      // Update pitch detector with actual sample rate
      this.pitchDetector = new PitchDetector(this.sampleRate);
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 8192;
      this.analyser.smoothingTimeConstant = 0;
      
      // Connect microphone to analyser
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
      
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }
  
  start(callback) {
    if (!this.audioContext) {
      console.error('Audio engine not initialized');
      return false;
    }
    
    this.onResult = callback;
    this.isRunning = true;
    this.processAudio();
    return true;
  }
  
  stop() {
    this.isRunning = false;
  }
  
  async processAudio() {
    if (!this.isRunning) return;
    
    try {
      // Get time domain data
      this.analyser.getFloatTimeDomainData(this.audioBuffer);
      
      // Filter noise and detect stable zone
      const filtered = this.noiseFilter.process(this.audioBuffer);
      
      if (filtered.isStable && filtered.signalQuality > 0.3) {
        // Perform FFT
        const spectrum = this.fftProcessor.process(filtered.data);
        
        // Detect pitch
        const pitchResult = this.pitchDetector.detect(filtered.data);
        
        if (pitchResult.confidence > 0.8 && pitchResult.frequency > 20) {
          // Analyze partials
          const partials = this.partialAnalyzer.analyze(
            spectrum.magnitudes,
            pitchResult.frequency,
            this.sampleRate,
            spectrum.bins
          );
          
          // Send results to callback
          if (this.onResult) {
            this.onResult({
              frequency: pitchResult.frequency,
              confidence: pitchResult.confidence,
              clarity: pitchResult.clarity,
              partials: partials,
              signalQuality: filtered.signalQuality,
              isStable: filtered.isStable,
              timestamp: Date.now()
            });
          }
        }
      }
    } catch (error) {
      console.error('Audio processing error:', error);
    }
    
    // Continue processing
    requestAnimationFrame(() => this.processAudio());
  }
  
  async release() {
    this.stop();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
  
  getAudioContext() {
    return this.audioContext;
  }
  
  getSampleRate() {
    return this.sampleRate;
  }
}
