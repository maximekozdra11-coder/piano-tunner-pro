/**
 * Inharmonicity Calculator
 * Estimates B coefficient using weighted least-squares from measured partials
 * Model: f_n = n * f0 * sqrt(1 + B * n²)
 */

export class InharmonicityCalculator {
  constructor() {
    this.minPartials = 3; // Need at least 3 partials for reliable fit
    this.maxIterations = 100;
    this.convergenceThreshold = 1e-8;
    this.outlierThreshold = 2.0; // Standard deviations for outlier rejection
  }
  
  /**
   * Calculate B coefficient from measured partials
   * Returns: { B, f0, confidence, residuals, outliers }
   */
  calculateB(partials, initialF0 = null) {
    if (partials.length < this.minPartials) {
      return {
        B: 0,
        f0: 0,
        confidence: 0,
        error: 'insufficient_partials'
      };
    }
    
    // Extract data
    const ns = partials.map(p => p.n);
    const freqs = partials.map(p => p.frequency);
    const weights = partials.map(p => p.quality || 1);
    
    // Initial estimate of f0 (from first partial if not provided)
    let f0 = initialF0 || freqs[0] / ns[0];
    
    // Initial B estimate using simplified formula
    let B = this.estimateInitialB(ns, freqs, f0);
    
    // Iterative refinement using Newton-Raphson
    const result = this.iterativeRefinement(ns, freqs, weights, f0, B);
    
    // Calculate residuals and detect outliers
    const residuals = this.calculateResiduals(ns, freqs, result.f0, result.B);
    const outliers = this.detectOutliers(residuals, this.outlierThreshold);
    
    // If outliers detected, refit without them
    if (outliers.length > 0 && partials.length - outliers.length >= this.minPartials) {
      const filteredPartials = partials.filter((_, i) => !outliers.includes(i));
      return this.calculateB(filteredPartials, result.f0);
    }
    
    // Calculate confidence based on fit quality
    const confidence = this.calculateConfidence(residuals, partials.length);
    
    // Validate B range (typical for piano: 0.00001 to 0.01)
    if (result.B < 0 || result.B > 0.02) {
      return {
        B: 0,
        f0: result.f0,
        confidence: 0,
        error: 'B_out_of_range',
        calculatedB: result.B
      };
    }
    
    return {
      B: result.B,
      f0: result.f0,
      confidence,
      residuals,
      outliers,
      iterations: result.iterations
    };
  }
  
  /**
   * Estimate initial B using simplified approach
   */
  estimateInitialB(ns, freqs, f0) {
    // For small B: f_n ≈ n*f0*(1 + B*n²/2)
    // Rearranging: B ≈ 2*(f_n/(n*f0) - 1)/n²
    
    let sumB = 0;
    let count = 0;
    
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];
      const ratio = freqs[i] / (n * f0);
      
      if (ratio > 1) { // B > 0
        const B_estimate = 2 * (ratio - 1) / (n * n);
        sumB += B_estimate;
        count++;
      }
    }
    
    return count > 0 ? sumB / count : 0.0001;
  }
  
  /**
   * Iterative refinement using Newton-Raphson optimization
   */
  iterativeRefinement(ns, freqs, weights, f0_init, B_init) {
    let f0 = f0_init;
    let B = B_init;
    
    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Calculate Jacobian and residual vector
      let sumDf0 = 0, sumDB = 0;
      let sumDf0_2 = 0, sumDB_2 = 0, sumDf0_DB = 0;
      
      for (let i = 0; i < ns.length; i++) {
        const n = ns[i];
        const f_measured = freqs[i];
        const w = weights[i];
        
        // Predicted frequency
        const sqrtTerm = Math.sqrt(1 + B * n * n);
        const f_predicted = n * f0 * sqrtTerm;
        
        // Residual
        const residual = f_measured - f_predicted;
        
        // Partial derivatives
        const df_df0 = n * sqrtTerm;
        const df_dB = (n * f0 * n * n) / (2 * sqrtTerm);
        
        // Weighted normal equations
        sumDf0 += w * residual * df_df0;
        sumDB += w * residual * df_dB;
        sumDf0_2 += w * df_df0 * df_df0;
        sumDB_2 += w * df_dB * df_dB;
        sumDf0_DB += w * df_df0 * df_dB;
      }
      
      // Solve 2x2 system for corrections
      const det = sumDf0_2 * sumDB_2 - sumDf0_DB * sumDf0_DB;
      
      if (Math.abs(det) < 1e-10) {
        break; // Singular matrix, stop
      }
      
      const delta_f0 = (sumDf0 * sumDB_2 - sumDB * sumDf0_DB) / det;
      const delta_B = (sumDB * sumDf0_2 - sumDf0 * sumDf0_DB) / det;
      
      // Update parameters
      f0 += delta_f0;
      B += delta_B;
      
      // Check convergence
      if (Math.abs(delta_f0) < this.convergenceThreshold && 
          Math.abs(delta_B) < this.convergenceThreshold) {
        return { f0, B, iterations: iter + 1, converged: true };
      }
    }
    
    return { f0, B, iterations: this.maxIterations, converged: false };
  }
  
  /**
   * Calculate residuals for all partials
   */
  calculateResiduals(ns, freqs, f0, B) {
    const residuals = [];
    
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];
      const f_measured = freqs[i];
      const f_predicted = n * f0 * Math.sqrt(1 + B * n * n);
      const residual = f_measured - f_predicted;
      
      residuals.push({
        index: i,
        n,
        measured: f_measured,
        predicted: f_predicted,
        residual,
        relativeError: residual / f_measured
      });
    }
    
    return residuals;
  }
  
  /**
   * Detect outliers using robust statistics (MAD)
   */
  detectOutliers(residuals, threshold) {
    const errors = residuals.map(r => r.residual);
    
    // Calculate median
    const sorted = [...errors].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Calculate MAD (Median Absolute Deviation)
    const deviations = errors.map(e => Math.abs(e - median));
    const sortedDev = [...deviations].sort((a, b) => a - b);
    const mad = sortedDev[Math.floor(sortedDev.length / 2)];
    
    // Identify outliers using modified Z-score
    const outliers = [];
    for (let i = 0; i < errors.length; i++) {
      const modifiedZScore = 0.6745 * deviations[i] / (mad + 1e-10);
      if (modifiedZScore > threshold) {
        outliers.push(i);
      }
    }
    
    return outliers;
  }
  
  /**
   * Calculate confidence score (0-1) based on fit quality
   */
  calculateConfidence(residuals, numPartials) {
    // RMS error
    const sumSquares = residuals.reduce((sum, r) => sum + r.residual * r.residual, 0);
    const rmsError = Math.sqrt(sumSquares / residuals.length);
    
    // Average frequency
    const avgFreq = residuals.reduce((sum, r) => sum + r.measured, 0) / residuals.length;
    
    // Relative RMS error
    const relativeError = rmsError / avgFreq;
    
    // Error score (lower is better)
    const errorScore = Math.exp(-relativeError * 1000); // Scale to reasonable range
    
    // Count score (more partials = higher confidence)
    const countScore = Math.min(1, numPartials / 8);
    
    // Combined confidence
    return errorScore * 0.7 + countScore * 0.3;
  }
  
  /**
   * Predict frequency for a given partial number
   */
  predictFrequency(n, f0, B) {
    return n * f0 * Math.sqrt(1 + B * n * n);
  }
  
  /**
   * Calculate expected stretch in cents for a partial
   */
  calculateStretchCents(n, B) {
    // Stretch = 1200 * log2(sqrt(1 + B*n²))
    return 1200 * Math.log2(Math.sqrt(1 + B * n * n));
  }
}
