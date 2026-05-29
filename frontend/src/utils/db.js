const DB_NAME = "OfflineCoderDB";
const DB_VERSION = 1;

class OfflineCoderDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB failed to open:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("🚀 IndexedDB Initialized Successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store questions list cache
        if (!db.objectStoreNames.contains("questions")) {
          db.createObjectStore("questions", { keyPath: "_id" });
        }

        // Store user submission histories
        if (!db.objectStoreNames.contains("submissions")) {
          db.createObjectStore("submissions", { keyPath: "_id", autoIncrement: true });
        }

        // Store markdown notes by questionId
        if (!db.objectStoreNames.contains("notes")) {
          db.createObjectStore("notes", { keyPath: "questionId" });
        }

        // Store custom playlists/revisions
        if (!db.objectStoreNames.contains("revisions")) {
          db.createObjectStore("revisions", { keyPath: "_id" });
        }

        // Queue of actions to be synchronized when online
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
        }

        console.log("📦 IndexedDB Object Stores Created");
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // --- Object Store Generic Wrappers ---
  async getStore(storeName, mode = "readonly") {
    const db = await this.ensureDB();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // --- Questions API ---
  async getAllQuestions() {
    const store = await this.getStore("questions");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getQuestionById(id) {
    const store = await this.getStore("questions");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveQuestions(questions) {
    const db = await this.ensureDB();
    const transaction = db.transaction("questions", "readwrite");
    const store = transaction.objectStore("questions");
    questions.forEach((q) => store.put(q));
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async saveQuestion(question) {
    const store = await this.getStore("questions", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(question);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Notes API ---
  async getNote(questionId) {
    const store = await this.getStore("notes");
    return new Promise((resolve, reject) => {
      const request = store.get(questionId);
      request.onsuccess = () => resolve(request.result ? request.result.content : "");
      request.onerror = () => reject(request.error);
    });
  }

  async saveNoteLocal(questionId, content) {
    const store = await this.getStore("notes", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({ questionId, content, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Submissions API ---
  async getSubmissionsByQuestion(questionId) {
    const store = await this.getStore("submissions");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result || [];
        resolve(all.filter((s) => s.questionId === questionId));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSubmissions() {
    const store = await this.getStore("submissions");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSubmission(submission) {
    const store = await this.getStore("submissions", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(submission);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Revisions API ---
  async getRevisions() {
    const store = await this.getStore("revisions");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveRevision(revision) {
    const store = await this.getStore("revisions", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(revision);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Synchronization Sync Queue ---
  async addToSyncQueue(method, url, data) {
    const store = await this.getStore("syncQueue", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({
        method,
        url,
        data,
        timestamp: Date.now()
      });
      request.onsuccess = () => {
        console.log(`📡 Offline operation queued: ${method} ${url}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    const store = await this.getStore("syncQueue");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id) {
    const store = await this.getStore("syncQueue", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue() {
    const store = await this.getStore("syncQueue", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbInstance = new OfflineCoderDB();
export default dbInstance;
