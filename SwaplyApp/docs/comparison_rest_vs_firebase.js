// Swaply - REST API vs Firebase Realtime karsilastirma
// Ayni veriyi (mesajlar) iki farkli yaklasimla cekme ornegi



//REST API (Express backend + fetch)

const fetchMessagesREST = async (chatId) => {
    try {
        const response = await fetch(`https://api.swaply.com/chats/${chatId}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) throw new Error('Mesajlar alinamadi');

        const messages = await response.json();
        return messages;
    } catch (err) {
        console.error('REST fetch hatasi:', err);
        return [];
    }
};


// Firebase Realtime (Firestore onSnapshot)

import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../src/services/firebaseConfig';

const subscribeMessagesFirebase = (chatId, callback) => {
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
