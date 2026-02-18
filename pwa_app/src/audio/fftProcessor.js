/**
 * High-Resolution FFT Processor
 * Implements Blackman-Harris windowing, zero-padding, and parabolic interpolation
 * for sub-cent accuracy in frequency detection
 */

export class FFTProcessor {
  constructor(bufferSize = 8192, sampleRate = 48000) {
    this.bufferSize = bufferSize;
    this.sampleRate = sampleRate;
    this.fftSize = bufferSize * 4; // 4x zero-padding for interpolation
    this.window = this.createBlackmanHarrisWindow(bufferSize);
    
    // Precompute FFT twiddle factors
    this.initFFT();
  }
  
  /**
   * Create Blackman-Harris window for optimal frequency resolution
   */
  createBlackmanHarrisWindow(size) {
    const window = new Float32Array(size);
    const a0 = 0.35875;
    const a1 = 0.48829;
    const a2 = 0.14128;
    const a3 = 0.01168;
    
    for (let i = 0; i < size; i++) {
      const phase = (2 * Math.PI * i) / (size - 1);
      window[i] = a0 
        - a1 * Math.cos(phase)
        + a2 * Math.cos(2 * phase)
        - a3 * Math.cos(3 * phase);
    }
    
    return window;
  }
  
  /**
   * Initialize FFT precomputation
   */
  initFFT() {
    this.cosTable = new Float32Array(this.fftSize / 2);
    this.sinTable = new Float32Array(this.fftSize / 2);
    
    for (let i = 0; i < this.fftSize / 2; i++) {
      const angle = -2 * Math.PI * i / this.fftSize;
      this.cosTable[i] = Math.cos(angle);
      this.sinTable[i] = Math.sin(angle);
    }
  }
  
  /**
   * Process audio buffer and return magnitude spectrum
   */
  process(audioBuffer) {
    // Apply window
    const windowed = new Float32Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      windowed[i] = audioBuffer[i] * this.window[i];
    }
    
    // Zero-pad to fftSize
    const padded = new Float32Array(this.fftSize);
    padded.set(windowed);
    
    // Perform FFT
    const { real, imag } = this.fft(padded);
    
    // Calculate magnitude spectrum
    const magnitude = new Float32Array(this.fftSize / 2);
    for (let i = 0; i < magnitude.length; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    
    return {
      magnitude,
      real,
      imag,
      frequencyResolution: this.sampleRate / this.fftSize
    };
  }
  
  /**
   * FFT implementation using Cooley-Tukey algorithm
   */
  fft(input) {
    const N = input.length;
    const real = new Float32Array(input);
    const imag = new Float32Array(N);
    
    // Bit-reversal permutation
    this.bitReversal(real, imag);
    
    // FFT butterfly operations
    for (let size = 2; size <= N; size *= 2) {
      const halfSize = size / 2;
      const tableStep = this.fftSize / size;
      
      for (let i = 0; i < N; i += size) {
        for (let j = i, k = 0; j < i + halfSize; j++, k += tableStep) {
          const evenReal = real[j];
          const evenImag = imag[j];
          const oddReal = real[j + halfSize];
          const oddImag = imag[j + halfSize];
          
          const cos = this.cosTable[k];
          const sin = this.sinTable[k];
          
          const twiddleReal = oddReal * cos - oddImag * sin;
          const twiddleImag = oddReal * sin + oddImag * cos;
          
          real[j] = evenReal + twiddleReal;
          imag[j] = evenImag + twiddleImag;
          real[j + halfSize] = evenReal - twiddleReal;
          imag[j + halfSize] = evenImag - twiddleImag;
        }
      }
    }
    
    return { real, imag };
  }
  
  /**
   * Bit-reversal permutation for FFT
   */
  bitReversal(real, imag) {
    const N = real.length;
    const log2N = Math.log2(N);
    
    for (let i = 0; i < N; i++) {
      let j = 0;
      for (let bit = 0; bit < log2N; bit++) {
        j = (j << 1) | ((i >> bit) & 1);
      }
      
      if (j > i) {
        [real[i], real[j]] = [real[j], real[i]];
        [imag[i], imag[j]] = [imag[j], imag[i]];
      }
    }
  }
  
  /**
   * Find peak with parabolic interpolation for sub-bin accuracy
   * Returns: { frequency, magnitude, phase }
   */
  findPeakWithInterpolation(magnitude, minFreq, maxFreq) {
    const minBin = Math.floor(minFreq / (this.sampleRate / this.fftSize));
    const maxBin = Math.ceil(maxFreq / (this.sampleRate / this.fftSize));
    
    let peakBin = minBin;
    let peakMagnitude = magnitude[minBin];
    
    for (let i = minBin + 1; i < maxBin && i < magnitude.length; i++) {
      if (magnitude[i] > peakMagnitude) {
        peakMagnitude = magnitude[i];
        peakBin = i;
      }
    }
    
    // Parabolic interpolation for sub-bin accuracy
    if (peakBin > 0 && peakBin < magnitude.length - 1) {
      const alpha = magnitude[peakBin - 1];
      const beta = magnitude[peakBin];
      const gamma = magnitude[peakBin + 1];
      
      const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
      const interpolatedBin = peakBin + p;
      const interpolatedMagnitude = beta - 0.25 * (alpha - gamma) * p;
      
      const frequency = interpolatedBin * (this.sampleRate / this.fftSize);
      
      return {
        frequency,
        magnitude: interpolatedMagnitude,
        bin: interpolatedBin
      };
    }
    
    return {
      frequency: peakBin * (this.sampleRate / this.fftSize),
      magnitude: peakMagnitude,
      bin: peakBin
    };
  }
  
  /**
   * Calculate frequency in Hz for a given bin
   */
  binToFrequency(bin) {
    return bin * this.sampleRate / this.fftSize;
  }
  
  /**
   * Calculate bin for a given frequency in Hz
   */
  frequencyToBin(frequency) {
    return frequency * this.fftSize / this.sampleRate;
  }
}
