import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// kullanicinin bildirilmemis matchlerini getir
export const getUnreadMatches = async (uid) => {
    const q1 = query(
        collection(db, 'matches'),
        where('user1', '==', uid),
        where('notified', '==', false)
    );
    const q2 = query(
        collection(db, 'matches'),
        where('user2', '==', uid),
        where('notified', '==', false)
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const results = [];
    snap1.forEach(d => results.push({ id: d.id, ...d.data() }));
    snap2.forEach(d => results.push({ id: d.id, ...d.data() }));

    return results;
};

// match'i goruldu olarak isaretle
export const markMatchAsNotified = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), {
        notified: true
    });
};

// unread match sayısı
export const getUnreadMatchCount = async (userId) => {
    try {
        const matchesRef = collection(db, 'matches');
        
        const q1 = query(
            matchesRef,
            where('user1', '==', userId),
            where('notified', '==', false)
        );
        
        const q2 = query(
            matchesRef,
            where('user2', '==', userId),
            where('notified', '==', false)
        );
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        return snap1.size + snap2.size;
    } catch (error) {
        console.log('Unread match count hatası:', error.message);
        return 0;
    }
};
