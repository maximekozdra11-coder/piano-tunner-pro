/**
 * Noise Filter
 * Detects hammer attack, extracts stable zone, and filters mechanical noise
 */

export class NoiseFilter {
  constructor(sampleRate = 48000) {
    this.sampleRate = sampleRate;
    this.attackThreshold = 0.3; // 30% of peak for attack detection
    this.stableWaitMs = 50; // Wait 50ms after attack before analysis
    this.minStableDurationMs = 100; // Need 100ms of stable signal
  }
  
  /**
   * Process audio buffer and return clean, stable portion
   * Returns: { cleanBuffer, isValid, attackTime, stableStart, signalQuality }
   */
  process(audioBuffer) {
    // Step 1: Detect attack (hammer strike)
    const attackInfo = this.detectAttack(audioBuffer);
    
    if (!attackInfo.detected) {
      return {
        cleanBuffer: null,
        isValid: false,
        reason: 'no_attack_detected',
        signalQuality: 0
      };
    }
    
    // Step 2: Wait for attack to decay
    const stableStartSample = attackInfo.attackSample + 
      Math.floor((this.stableWaitMs / 1000) * this.sampleRate);
    
    if (stableStartSample >= audioBuffer.length) {
      return {
        cleanBuffer: null,
        isValid: false,
        reason: 'buffer_too_short',
        signalQuality: 0
      };
    }
    
    // Step 3: Extract stable zone
    const stableZone = this.extractStableZone(audioBuffer, stableStartSample);
    
    if (!stableZone.isValid) {
      return {
        cleanBuffer: null,
        isValid: false,
        reason: 'unstable_signal',
        signalQuality: stableZone.quality
      };
    }
    
    // Step 4: Apply bandpass filter centered on fundamental
    const cleanBuffer = this.applyAdaptiveBandpass(stableZone.buffer, stableZone.estimatedFreq);
    
    // Step 5: Calculate final signal quality
    const signalQuality = this.calculateSignalQuality(cleanBuffer, stableZone.quality);
    
    return {
      cleanBuffer,
      isValid: true,
      attackTime: attackInfo.attackSample / this.sampleRate,
      stableStart: stableStartSample / this.sampleRate,
      signalQuality,
      estimatedFreq: stableZone.estimatedFreq
    };
  }
  
  /**
   * Detect hammer attack using RMS envelope
   */
  detectAttack(buffer) {
    const windowSize = Math.floor(this.sampleRate * 0.005); // 5ms window
    const envelope = this.calculateRMSEnvelope(buffer, windowSize);
    
    // Find peak of envelope
    let peakValue = 0;
    let peakSample = 0;
    
    for (let i = 0; i < envelope.length; i++) {
      if (envelope[i] > peakValue) {
        peakValue = envelope[i];
        peakSample = i;
      }
    }
    
    // Find attack start (when envelope crosses threshold going up)
    const threshold = peakValue * this.attackThreshold;
    let attackSample = 0;
    
    for (let i = 0; i < peakSample; i++) {
      if (envelope[i] >= threshold && envelope[i] < envelope[i + 1]) {
        attackSample = i;
        break;
      }
    }
    
    // Validate attack characteristics
    const riseTime = (peakSample - attackSample) / this.sampleRate;
    const isValidAttack = riseTime > 0.001 && riseTime < 0.05; // 1-50ms rise time
    
    return {
      detected: isValidAttack && peakValue > 0.01, // Minimum amplitude
      attackSample,
      peakSample,
      peakValue,
      riseTime
    };
  }
  
  /**
   * Calculate RMS envelope
   */
  calculateRMSEnvelope(buffer, windowSize) {
    const envelope = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      let sum = 0;
      let count = 0;
      
      const start = Math.max(0, i - windowSize / 2);
      const end = Math.min(buffer.length, i + windowSize / 2);
      
      for (let j = start; j < end; j++) {
        sum += buffer[j] * buffer[j];
        count++;
      }
      
      envelope[i] = Math.sqrt(sum / count);
    }
    
    return envelope;
  }
  
  /**
   * Extract stable zone after attack
   */
  extractStableZone(buffer, startSample) {
    const minLength = Math.floor((this.minStableDurationMs / 1000) * this.sampleRate);
    
    if (startSample + minLength > buffer.length) {
      return {
        isValid: false,
        quality: 0
      };
    }
    
    // Extract portion after attack
    const stableBuffer = buffer.slice(startSample, startSample + minLength * 2);
    
    // Analyze stability using amplitude variation
    const stability = this.analyzeStability(stableBuffer);
    
    if (stability.score < 0.5) {
      return {
        isValid: false,
        quality: stability.score
      };
    }
    
    // Estimate fundamental frequency for bandpass filter
    const estimatedFreq = this.estimateFrequency(stableBuffer);
    
    return {
      isValid: true,
      buffer: stableBuffer,
      quality: stability.score,
      estimatedFreq
    };
  }
  
  /**
   * Analyze signal stability
   */
  analyzeStability(buffer) {
    const chunkSize = Math.floor(buffer.length / 4);
    const chunks = [];
    
    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunk = buffer.slice(start, end);
      
      // Calculate RMS for each chunk
      let rms = 0;
      for (let j = 0; j < chunk.length; j++) {
        rms += chunk[j] * chunk[j];
      }
      rms = Math.sqrt(rms / chunk.length);
      chunks.push(rms);
    }
    
    // Calculate coefficient of variation
    const mean = chunks.reduce((sum, val) => sum + val, 0) / chunks.length;
    const variance = chunks.reduce((sum, val) => sum + (val - mean) ** 2, 0) / chunks.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 1;
    
    // Lower CV = more stable
    const score = Math.max(0, 1 - cv * 2);
    
    return {
      score,
      coefficientOfVariation: cv,
      meanAmplitude: mean
    };
  }
  
  /**
   * Estimate frequency using zero-crossing rate
   */
  estimateFrequency(buffer) {
    let zeroCrossings = 0;
    
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i - 1] >= 0 && buffer[i] < 0) || 
          (buffer[i - 1] < 0 && buffer[i] >= 0)) {
        zeroCrossings++;
      }
    }
    
    // Frequency = (zero crossings / 2) / duration
    const duration = buffer.length / this.sampleRate;
    const frequency = (zeroCrossings / 2) / duration;
    
    return frequency;
  }
  
  /**
   * Apply adaptive bandpass filter centered on fundamental
   */
  applyAdaptiveBandpass(buffer, centerFreq) {
    if (!centerFreq || centerFreq < 20 || centerFreq > 5000) {
      return buffer; // No filtering if freq is invalid
    }
    
    // Simple bandpass: keep energy around fundamental and harmonics
    // More sophisticated filtering could use IIR or biquad filters
    
    // For now, return the buffer (in production, implement proper bandpass)
    // This would require implementing biquad or butterworth filters
    return buffer;
  }
  
  /**
   * Calculate overall signal quality
   */
  calculateSignalQuality(buffer, stabilityScore) {
    // Calculate SNR estimate
    const rms = this.calculateRMS(buffer);
    const snrScore = Math.min(1, rms * 10); // Scale RMS to 0-1
    
    // Combine stability and SNR
    const quality = stabilityScore * 0.6 + snrScore * 0.4;
    
    return Math.min(1, Math.max(0, quality));
  }
  
  /**
   * Calculate RMS (root mean square)
   */
  calculateRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }
  
  /**
   * Estimate noise floor
   */
  estimateNoiseFloor(buffer) {
    // Use lower percentile of amplitudes as noise estimate
    const sorted = [...buffer].map(Math.abs).sort((a, b) => a - b);
    const percentile10 = sorted[Math.floor(sorted.length * 0.1)];
    return percentile10;
  }
}
