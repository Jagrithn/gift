const DATABASE_NAME = 'birthday-journey-local-assets';
const STORE_NAME = 'assets';

function openAssetDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local media storage.'));
  });
}

export async function saveLocalAsset(key: string, file: File): Promise<void> {
  const database = await openAssetDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(file, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save this file on this browser.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Saving this file was cancelled.'));
    });
  } finally {
    database.close();
  }
}

export async function getLocalAsset(key: string): Promise<Blob | null> {
  const database = await openAssetDatabase();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error('Could not read local media.'));
    });
  } finally {
    database.close();
  }
}

export async function clearLocalAssets(): Promise<void> {
  const database = await openAssetDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not clear local media.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Clearing local media was cancelled.'));
    });
  } finally {
    database.close();
  }
}

export async function pruneLocalAssets(referencedKeys: string[]): Promise<void> {
  const database = await openAssetDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const referenced = new Set(referencedKeys);
      const request = store.getAllKeys();
      request.onsuccess = () => {
        for (const key of request.result) {
          if (typeof key === 'string' && !referenced.has(key)) store.delete(key);
        }
      };
      request.onerror = () => reject(request.error ?? new Error('Could not clean up local media.'));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not clean up local media.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Cleaning up local media was cancelled.'));
    });
  } finally {
    database.close();
  }
}
