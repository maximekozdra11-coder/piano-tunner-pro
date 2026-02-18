import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'audio-engine': ['./src/audio/audioEngine.js'],
          'math-engine': ['./src/math/inharmonicity.js', './src/math/stretchTuning.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
