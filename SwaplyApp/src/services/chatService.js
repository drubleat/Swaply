import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// mesaj gonder
export const sendMessage = async (chatId, senderId, text) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    await addDoc(messagesRef, {
        senderId,
        text,
        timestamp: serverTimestamp()
    });
};

// mesajlari dinle (realtime)
export const subscribeToMessages = (chatId, callback) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });

    return unsubscribe;
};

// iki kullanici icin chat id olustur
export const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
};
