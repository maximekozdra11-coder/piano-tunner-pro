/**
 * Hybrid Pitch Detector
 * Combines YIN algorithm with FFT-based autocorrelation for high accuracy
 * Target: < ±0.1 cent precision
 */

export class PitchDetector {
  constructor(sampleRate = 48000, bufferSize = 8192) {
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;
    this.minFreq = 27.5; // A0
    this.maxFreq = 4186; // C8
    this.threshold = 0.15; // YIN threshold
    
    // Precompute for FFT-based autocorrelation
    this.fftSize = this.nextPowerOf2(bufferSize * 2);
    this.initAutocorrelation();
  }
  
  nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }
  
  initAutocorrelation() {
    this.cosTable = new Float32Array(this.fftSize / 2);
    this.sinTable = new Float32Array(this.fftSize / 2);
    
    for (let i = 0; i < this.fftSize / 2; i++) {
      const angle = -2 * Math.PI * i / this.fftSize;
      this.cosTable[i] = Math.cos(angle);
      this.sinTable[i] = Math.sin(angle);
    }
  }
  
  /**
   * Detect pitch using hybrid YIN + autocorrelation
   * Returns: { frequency, confidence, clarity }
   */
  detectPitch(audioBuffer) {
    // Step 1: Calculate difference function via FFT-based autocorrelation
    const diff = this.calculateDifferenceFunction(audioBuffer);
    
    // Step 2: Cumulative mean normalized difference (CMNDF)
    const cmndf = this.cumulativeMeanNormalizedDifference(diff);
    
    // Step 3: Find first minimum below threshold
    const tau = this.findFirstMinimum(cmndf);
    
    if (tau === -1) {
      return { frequency: 0, confidence: 0, clarity: 0 };
    }
    
    // Step 4: Parabolic interpolation for sub-sample accuracy
    const { interpolatedTau, interpolatedValue } = this.parabolicInterpolation(cmndf, tau);
    
    // Calculate frequency
    const frequency = this.sampleRate / interpolatedTau;
    
    // Validate frequency range
    if (frequency < this.minFreq || frequency > this.maxFreq) {
      return { frequency: 0, confidence: 0, clarity: 0 };
    }
    
    // Calculate confidence (inverse of CMNDF value)
    const confidence = Math.max(0, 1 - interpolatedValue);
    
    // Calculate clarity (sharpness of the minimum)
    const clarity = this.calculateClarity(cmndf, tau);
    
    return {
      frequency,
      confidence,
      clarity,
      tau: interpolatedTau
    };
  }
  
  /**
   * Calculate difference function using FFT-based autocorrelation
   * d(τ) = 2(r(0) - r(τ)) where r is the autocorrelation
   */
  calculateDifferenceFunction(buffer) {
    const N = buffer.length;
    
    // FFT-based autocorrelation for O(n log n) instead of O(n²)
    const autocorr = this.fftAutocorrelation(buffer);
    
    // Calculate difference function
    const diff = new Float32Array(N / 2);
    const r0 = autocorr[0];
    
    for (let tau = 0; tau < diff.length; tau++) {
      diff[tau] = 2 * (r0 - autocorr[tau]);
    }
    
    return diff;
  }
  
  /**
   * FFT-based autocorrelation (fast, O(n log n))
   */
  fftAutocorrelation(buffer) {
    const N = buffer.length;
    
    // Zero-pad to fftSize
    const padded = new Float32Array(this.fftSize);
    padded.set(buffer);
    
    // Forward FFT
    const { real: fftReal, imag: fftImag } = this.fft(padded);
    
    // Power spectrum S = |FFT(x)|²
    const power = new Float32Array(this.fftSize);
    for (let i = 0; i < this.fftSize; i++) {
      power[i] = fftReal[i] * fftReal[i] + fftImag[i] * fftImag[i];
    }
    
    // Inverse FFT of power spectrum
    const { real: autocorr } = this.ifft(power);
    
    // Return first half (positive lags)
    return autocorr.slice(0, N);
  }
  
  /**
   * FFT implementation (Cooley-Tukey)
   */
  fft(input) {
    const N = input.length;
    const real = new Float32Array(input);
    const imag = new Float32Array(N);
    
    this.bitReversal(real, imag, N);
    
    for (let size = 2; size <= N; size *= 2) {
      const halfSize = size / 2;
      const tableStep = this.fftSize / size;
      
      for (let i = 0; i < N; i += size) {
        for (let j = i, k = 0; j < i + halfSize; j++, k += tableStep) {
          const cos = this.cosTable[k % (this.fftSize / 2)];
          const sin = this.sinTable[k % (this.fftSize / 2)];
          
          const twiddleReal = real[j + halfSize] * cos - imag[j + halfSize] * sin;
          const twiddleImag = real[j + halfSize] * sin + imag[j + halfSize] * cos;
          
          real[j + halfSize] = real[j] - twiddleReal;
          imag[j + halfSize] = imag[j] - twiddleImag;
          real[j] += twiddleReal;
          imag[j] += twiddleImag;
        }
      }
    }
    
    return { real, imag };
  }
  
  /**
   * Inverse FFT
   */
  ifft(input) {
    const N = input.length;
    const real = new Float32Array(input);
    const imag = new Float32Array(N);
    
    // Conjugate
    for (let i = 0; i < N; i++) {
      imag[i] = -imag[i];
    }
    
    // Forward FFT
    const result = this.fft(real);
    
    // Conjugate and scale
    for (let i = 0; i < N; i++) {
      result.real[i] /= N;
      result.imag[i] = -result.imag[i] / N;
    }
    
    return result;
  }
  
  bitReversal(real, imag, N) {
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
   * Cumulative Mean Normalized Difference Function
   */
  cumulativeMeanNormalizedDifference(diff) {
    const cmndf = new Float32Array(diff.length);
    cmndf[0] = 1;
    
    let runningSum = 0;
    for (let tau = 1; tau < diff.length; tau++) {
      runningSum += diff[tau];
      cmndf[tau] = diff[tau] / (runningSum / tau);
    }
    
    return cmndf;
  }
  
  /**
   * Find first minimum below threshold
   */
  findFirstMinimum(cmndf) {
    const minPeriod = Math.floor(this.sampleRate / this.maxFreq);
    const maxPeriod = Math.floor(this.sampleRate / this.minFreq);
    
    for (let tau = minPeriod; tau < maxPeriod && tau < cmndf.length; tau++) {
      if (cmndf[tau] < this.threshold) {
        // Find local minimum
        while (tau + 1 < cmndf.length && cmndf[tau + 1] < cmndf[tau]) {
          tau++;
        }
        return tau;
      }
    }
    
    return -1;
  }
  
  /**
   * Parabolic interpolation for sub-sample accuracy
   */
  parabolicInterpolation(cmndf, tau) {
    if (tau <= 0 || tau >= cmndf.length - 1) {
      return { interpolatedTau: tau, interpolatedValue: cmndf[tau] };
    }
    
    const alpha = cmndf[tau - 1];
    const beta = cmndf[tau];
    const gamma = cmndf[tau + 1];
    
    const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
    
    return {
      interpolatedTau: tau + p,
      interpolatedValue: beta - 0.25 * (alpha - gamma) * p
    };
  }
  
  /**
   * Calculate clarity (sharpness of minimum)
   */
  calculateClarity(cmndf, tau) {
    if (tau <= 1 || tau >= cmndf.length - 2) {
      return 0;
    }
    
    const depth = (cmndf[tau - 1] + cmndf[tau + 1]) / 2 - cmndf[tau];
    return Math.max(0, Math.min(1, depth * 5)); // Scale to 0-1
  }
  
  /**
   * Analyze signal stability (for auto-validation)
   */
  analyzeStability(recentPitches) {
    if (recentPitches.length < 2) {
      return { stable: false, deviation: Infinity };
    }
    
    const mean = recentPitches.reduce((sum, p) => sum + p, 0) / recentPitches.length;
    const deviations = recentPitches.map(p => Math.abs(p - mean));
    const maxDeviation = Math.max(...deviations);
    
    // Convert to cents
    const centsDeviation = 1200 * Math.log2(1 + maxDeviation / mean);
    
    return {
      stable: centsDeviation < 1, // Stable within ±1 cent
      deviation: centsDeviation
    };
  }
}
