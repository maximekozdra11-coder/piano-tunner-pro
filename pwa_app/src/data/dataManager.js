/**
 * Data Manager - IndexedDB wrapper for offline storage
 */

export class DataManager {
  constructor() {
    this.db = null;
    this.dbName = 'PianoTunerDB';
    this.dbVersion = 1;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('pianos')) {
          const pianoStore = db.createObjectStore('pianos', { keyPath: 'id', autoIncrement: true });
          pianoStore.createIndex('name', 'name', { unique: false });
          pianoStore.createIndex('created', 'created', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('measurements')) {
          const measurementStore = db.createObjectStore('measurements', { keyPath: 'id', autoIncrement: true });
          measurementStore.createIndex('pianoId', 'pianoId', { unique: false });
          measurementStore.createIndex('note', 'note', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('pianoId', 'pianoId', { unique: false });
          sessionStore.createIndex('started', 'started', { unique: false });
        }
      };
    });
  }
  
  async savePiano(piano) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pianos'], 'readwrite');
      const store = transaction.objectStore('pianos');
      const request = piano.id ? store.put(piano) : store.add(piano);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getPianos() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pianos'], 'readonly');
      const store = transaction.objectStore('pianos');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getPiano(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pianos'], 'readonly');
      const store = transaction.objectStore('pianos');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async deletePiano(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pianos'], 'readwrite');
      const store = transaction.objectStore('pianos');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async saveMeasurement(measurement) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['measurements'], 'readwrite');
      const store = transaction.objectStore('measurements');
      const request = store.add(measurement);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getMeasurements(pianoId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['measurements'], 'readonly');
      const store = transaction.objectStore('measurements');
      const index = store.index('pianoId');
      const request = index.getAll(pianoId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async saveSession(session) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = session.id ? store.put(session) : store.add(session);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getSessions(pianoId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('pianoId');
      const request = index.getAll(pianoId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
