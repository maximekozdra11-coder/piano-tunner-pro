/**
 * Partial Analyzer
 * Detects and analyzes partials/harmonics from FFT spectrum
 * for inharmonicity calculation
 */

export class PartialAnalyzer {
  constructor(sampleRate = 48000) {
    this.sampleRate = sampleRate;
    this.maxPartials = 12;
    this.searchWindow = 0.05; // ±5% window around expected frequency
  }
  
  /**
   * Analyze partials for a given fundamental frequency
   * Returns array of { n, frequency, amplitude, snr, quality }
   */
  analyzePartials(magnitude, frequencyResolution, fundamentalFreq) {
    const partials = [];
    
    for (let n = 1; n <= this.maxPartials; n++) {
      const expectedFreq = n * fundamentalFreq;
      
      // Skip if expected frequency is beyond Nyquist
      if (expectedFreq > this.sampleRate / 2) {
        break;
      }
      
      const partial = this.findPartial(magnitude, frequencyResolution, expectedFreq, n);
      
      if (partial) {
        partials.push(partial);
      }
    }
    
    return partials;
  }
  
  /**
   * Find a specific partial with parabolic interpolation
   */
  findPartial(magnitude, freqRes, expectedFreq, partialNumber) {
    // Define search window (±5% of expected frequency)
    const minFreq = expectedFreq * (1 - this.searchWindow);
    const maxFreq = expectedFreq * (1 + this.searchWindow);
    
    const minBin = Math.floor(minFreq / freqRes);
    const maxBin = Math.ceil(maxFreq / freqRes);
    
    // Find peak in window
    let peakBin = minBin;
    let peakMagnitude = magnitude[minBin] || 0;
    
    for (let bin = minBin; bin <= maxBin && bin < magnitude.length; bin++) {
      if (magnitude[bin] > peakMagnitude) {
        peakMagnitude = magnitude[bin];
        peakBin = bin;
      }
    }
    
    // Parabolic interpolation for sub-bin accuracy
    const { frequency, magnitude: interpolatedMag } = this.parabolicInterpolation(
      magnitude,
      peakBin,
      freqRes
    );
    
    // Calculate SNR (signal-to-noise ratio)
    const snr = this.calculateSNR(magnitude, peakBin, minBin, maxBin);
    
    // Calculate quality score based on SNR and proximity to expected
    const proximityScore = this.calculateProximityScore(frequency, expectedFreq);
    const quality = (snr / 40) * 0.7 + proximityScore * 0.3; // Weighted combination
    
    // Only return if quality is sufficient
    if (quality < 0.3 || snr < 6) { // SNR > 6 dB minimum
      return null;
    }
    
    return {
      n: partialNumber,
      frequency,
      amplitude: interpolatedMag,
      snr,
      quality: Math.min(1, quality),
      expectedFreq,
      deviation: ((frequency - expectedFreq) / expectedFreq) * 100 // percentage
    };
  }
  
  /**
   * Parabolic interpolation for sub-bin accuracy
   */
  parabolicInterpolation(magnitude, peakBin, freqRes) {
    if (peakBin <= 0 || peakBin >= magnitude.length - 1) {
      return {
        frequency: peakBin * freqRes,
        magnitude: magnitude[peakBin]
      };
    }
    
    const alpha = magnitude[peakBin - 1];
    const beta = magnitude[peakBin];
    const gamma = magnitude[peakBin + 1];
    
    // Parabolic peak location
    const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
    const interpolatedBin = peakBin + p;
    const interpolatedMag = beta - 0.25 * (alpha - gamma) * p;
    
    return {
      frequency: interpolatedBin * freqRes,
      magnitude: interpolatedMag
    };
  }
  
  /**
   * Calculate Signal-to-Noise Ratio in dB
   */
  calculateSNR(magnitude, peakBin, minBin, maxBin) {
    const signalPower = magnitude[peakBin] * magnitude[peakBin];
    
    // Estimate noise from bins around the peak (excluding immediate neighbors)
    let noisePower = 0;
    let noiseCount = 0;
    
    const excludeRadius = 3; // Bins to exclude around peak
    
    for (let bin = minBin; bin <= maxBin; bin++) {
      if (Math.abs(bin - peakBin) > excludeRadius) {
        noisePower += magnitude[bin] * magnitude[bin];
        noiseCount++;
      }
    }
    
    if (noiseCount === 0) {
      return 0;
    }
    
    const avgNoisePower = noisePower / noiseCount;
    
    // Avoid division by zero or log of zero
    if (avgNoisePower < 1e-10) {
      return 100; // Very high SNR
    }
    
    const snr = 10 * Math.log10(signalPower / avgNoisePower);
    return Math.max(0, snr);
  }
  
  /**
   * Calculate proximity score (0-1) based on how close measured is to expected
   */
  calculateProximityScore(measuredFreq, expectedFreq) {
    const deviation = Math.abs(measuredFreq - expectedFreq) / expectedFreq;
    
    // Score decreases with deviation
    // Within 2%: full score
    // Beyond 5%: zero score
    if (deviation < 0.02) {
      return 1;
    } else if (deviation > this.searchWindow) {
      return 0;
    } else {
      return 1 - (deviation - 0.02) / (this.searchWindow - 0.02);
    }
  }
  
  /**
   * Weight partials by SNR for downstream processing
   * Returns weights array corresponding to partials
   */
  calculateWeights(partials) {
    if (partials.length === 0) {
      return [];
    }
    
    // Calculate weights based on quality and SNR
    const rawWeights = partials.map(p => p.quality * Math.sqrt(p.snr / 40));
    
    // Normalize weights to sum to 1
    const sumWeights = rawWeights.reduce((sum, w) => sum + w, 0);
    
    return rawWeights.map(w => w / sumWeights);
  }
  
  /**
   * Reject outlier partials using statistical methods
   */
  rejectOutliers(partials, threshold = 2) {
    if (partials.length < 4) {
      return partials; // Need at least 4 points for outlier detection
    }
    
    // Calculate residuals (deviation from theoretical inharmonicity model)
    // This is a simplified check - full check happens in inharmonicity module
    const deviations = partials.map(p => Math.abs(p.deviation));
    
    // Calculate median absolute deviation (MAD)
    const sortedDev = [...deviations].sort((a, b) => a - b);
    const median = sortedDev[Math.floor(sortedDev.length / 2)];
    
    const mad = deviations.map(d => Math.abs(d - median));
    const madMedian = [...mad].sort((a, b) => a - b)[Math.floor(mad.length / 2)];
    
    // Filter based on MAD (robust to outliers)
    return partials.filter((p, i) => {
      const modifiedZScore = 0.6745 * mad[i] / (madMedian + 1e-10);
      return modifiedZScore < threshold;
    });
  }
  
  /**
   * Validate partial detection quality
   * Returns confidence score 0-1
   */
  validatePartialSet(partials) {
    if (partials.length < 3) {
      return 0;
    }
    
    const avgQuality = partials.reduce((sum, p) => sum + p.quality, 0) / partials.length;
    const avgSNR = partials.reduce((sum, p) => sum + p.snr, 0) / partials.length;
    
    const countScore = Math.min(1, partials.length / 6); // Prefer 6+ partials
    const qualityScore = avgQuality;
    const snrScore = Math.min(1, avgSNR / 30); // 30 dB is good
    
    return countScore * 0.3 + qualityScore * 0.4 + snrScore * 0.3;
  }
}
