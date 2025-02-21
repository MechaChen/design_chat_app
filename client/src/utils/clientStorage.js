import { openDB } from 'idb';

const dbName = 'chatApp';
const dbVersion = 1;
const draftMessageStoreName = 'draftMessages';
const draftMessageStoreKeyPath = 'roomId';

export async function initDB() {
    const db = await openDB(dbName, dbVersion, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(draftMessageStoreName)) {
                db.createObjectStore(
                    draftMessageStoreName,
                    { keyPath: draftMessageStoreKeyPath }
                );
            }
        },
    });

    return db;
}

export async function storeDraftMessage(db, { roomId, userId, message, fileList }) {
    await db.put(draftMessageStoreName, { roomId, userId, message, fileList });
}

export async function getDraftMessage(db, { roomId }) {
    return await db.get(draftMessageStoreName, roomId);
}
