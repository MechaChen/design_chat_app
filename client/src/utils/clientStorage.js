import { openDB } from 'idb';

const dbName = 'chatApp';
const dbNewestVersion = 3;
const draftMessageStoreName = 'draftMessages';
const draftMessageStoreKeyPath = 'userIdAndRoomId';
const outgoingMessageStoreName = 'outgoingMessages';
const outgoingMessageStoreKeyPath = 'message_id';

export async function initDB() {
    const db = await openDB(dbName, dbNewestVersion, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            // update draft message store keyPath from roomId to userIdAndRoomId
            if (oldVersion < 1) { 
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

            if (oldVersion < 2) {
                db.createObjectStore(outgoingMessageStoreName, {
                    keyPath: outgoingMessageStoreKeyPath
                });
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

export async function storeOutgoingMessage(db, { message_id, message, room_id, sender, status }) {
    await db.put(outgoingMessageStoreName, { message_id, message, room_id, sender, status });
}

export async function deleteOutgoingMessage(db, { message_id }) {
    await db.delete(outgoingMessageStoreName, message_id);
}

export async function getAllOutgoingMessage(db) {
    return await db.getAll(outgoingMessageStoreName);
}