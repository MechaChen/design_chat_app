import { openDB } from 'idb';

const dbName = 'chatApp';
const dbNewestVersion = 2;
const draftMessageStoreName = 'draftMessages';
const draftMessageStoreKeyPath = 'userIdAndRoomId';

export async function initDB() {
    const db = await openDB(dbName, dbNewestVersion, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            switch (oldVersion) {
                // update draft message store keyPath from roomId to userIdAndRoomId
                case 1: { 
                    let oldDrafts = [];

                    if (db.objectStoreNames.contains(draftMessageStoreName)) {
                        const oldStore = transaction.objectStore(draftMessageStoreName);
                        oldDrafts = await oldStore.getAll();
                        db.deleteObjectStore(draftMessageStoreName);
                    }

                    const newDraftMessageStore = db.createObjectStore(draftMessageStoreName, {
                        keyPath: draftMessageStoreKeyPath
                    });

                    oldDrafts.forEach((draft) => {
                        draft.userIdAndRoomId = `${draft.userId}_${draft.roomId}`;
                        newDraftMessageStore.add(draft);
                    });
                }
            }
        },
    });

    return db;
}

export async function storeDraftMessage(db, { userIdAndRoomId, message, fileList }) {
    await db.put(draftMessageStoreName, { userIdAndRoomId, message, fileList });
}

export async function getDraftMessage(db, { userIdAndRoomId }) {
    return await db.get(draftMessageStoreName, userIdAndRoomId);
}
