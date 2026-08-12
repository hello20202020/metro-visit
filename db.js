// IndexedDB 封装，模拟 localStorage 的 key-value 接口
const DB_NAME = 'metro_explorer_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const OLD_STORAGE_KEY = 'metro_explorer_data';

let dbInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function dbGet(key) {
  if (!dbInstance) await openDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbSet(key, value) {
  if (!dbInstance) await openDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 从旧的 localStorage 迁移数据到 IndexedDB
async function migrateFromLocalStorage() {
  try {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData) {
      const parsed = JSON.parse(oldData);
      await dbSet('appData', parsed);
      localStorage.removeItem(OLD_STORAGE_KEY);
      console.log('数据已从 localStorage 迁移到 IndexedDB');
      return parsed;
    }
  } catch (e) {
    console.warn('迁移 localStorage 数据失败:', e);
  }
  return null;
}

async function dbLoadData() {
  // 先尝试从 IndexedDB 读取
  let data = await dbGet('appData');
  // 如果没有，尝试从 localStorage 迁移
  if (!data) {
    data = await migrateFromLocalStorage();
  }
  return data || {};
}

async function dbSaveData(data) {
  await dbSet('appData', data);
}
