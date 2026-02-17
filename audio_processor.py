"""
AudioProcessor - Gestion du flux audio avec sounddevice
"""
import numpy as np
from collections import deque

try:
    import sounddevice as sd
    SOUNDDEVICE_AVAILABLE = True
except (OSError, ImportError) as e:
    SOUNDDEVICE_AVAILABLE = False
    print(f"Warning: sounddevice not available: {e}")
    print("Audio capture will not work, but other modules can be tested.")


class AudioProcessor:
    """
    Gère la capture audio en temps réel avec un buffer circulaire.
    """
    
    def __init__(self, sample_rate=44100, buffer_size=8192, callback=None):
        """
        Initialise le processeur audio.
        
        Args:
            sample_rate (int): Fréquence d'échantillonnage en Hz (minimum 44100).
                              Si une valeur inférieure est fournie, elle sera automatiquement
                              ajustée à 44100 Hz.
            buffer_size (int): Taille de la fenêtre glissante (4096 ou 8192)
            callback (callable): Fonction appelée avec les nouvelles données audio
        """
        self.sample_rate = max(sample_rate, 44100)
        self.buffer_size = buffer_size
        self.callback = callback
        
        # Buffer circulaire pour la fenêtre glissante
        self.buffer = deque(maxlen=buffer_size)
        
        # Stream audio
        self.stream = None
        self.is_running = False
        
    def _audio_callback(self, indata, frames, time, status):
        """
        Callback appelé par sounddevice lors de la capture audio.
        Non-bloquant pour éviter les pertes de données.
        
        Args:
            indata: Données audio capturées
            frames: Nombre de frames
            time: Timestamps
            status: État du stream
        """
        if status:
            print(f"Audio status: {status}")
        
        # Ajouter les nouvelles données au buffer circulaire
        audio_data = indata[:, 0] if indata.ndim > 1 else indata
        self.buffer.extend(audio_data.flatten())
        
        # Appeler le callback utilisateur si le buffer est plein
        if len(self.buffer) >= self.buffer_size and self.callback:
            buffer_array = np.array(self.buffer)
            self.callback(buffer_array)
    
    def start(self):
        """Démarre la capture audio."""
        if not SOUNDDEVICE_AVAILABLE:
            raise RuntimeError("sounddevice is not available. Please install PortAudio.")
        
        if self.is_running:
            return
        
        try:
            self.stream = sd.InputStream(
                channels=1,
                samplerate=self.sample_rate,
                blocksize=1024,
                callback=self._audio_callback
            )
            self.stream.start()
            self.is_running = True
            print(f"Audio capture started at {self.sample_rate} Hz")
        except Exception as e:
            print(f"Error starting audio capture: {e}")
            raise
    
    def stop(self):
        """Arrête la capture audio."""
        if self.stream and self.is_running:
            self.stream.stop()
            self.stream.close()
            self.is_running = False
            print("Audio capture stopped")
    
    def get_buffer(self):
        """
        Retourne le contenu actuel du buffer.
        
        Returns:
            np.ndarray: Buffer audio
        """
        return np.array(self.buffer)
    
    def clear_buffer(self):
        """Vide le buffer."""
        self.buffer.clear()
