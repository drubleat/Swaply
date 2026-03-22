import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// iki kullanici arasinda zaten eslesme var mi
export const checkExistingMatch = async (user1, user2) => {
    const q1 = query(
        collection(db, 'matches'),
        where('user1', '==', user1),
        where('user2', '==', user2)
    );
    const q2 = query(
        collection(db, 'matches'),
        where('user1', '==', user2),
        where('user2', '==', user1)
    );
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    return snap1.docs.length > 0 || snap2.docs.length > 0;
};

// kullanicinin skillsToLearn'une gore eslesen kullanicilari bul
export const findMatches = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) throw new Error('Kullanıcı bulunamadı');

    const userData = userDoc.data();
    const skillsToLearn = userData.skillsToLearn;

    if (!skillsToLearn || skillsToLearn.length === 0) return [];

    const matches = [];
    const processedUsers = new Set();

    for (const skill of skillsToLearn) {
        const q = query(
            collection(db, 'users'),
            where('skillsToTeach', 'array-contains', skill)
        );

        const snapshot = await getDocs(q);

        for (const matchDoc of snapshot.docs) {
            if (matchDoc.id === uid) continue;
            if (processedUsers.has(matchDoc.id)) continue;

            processedUsers.add(matchDoc.id);

            // duplicate kontrolu
            const alreadyMatched = await checkExistingMatch(uid, matchDoc.id);
            if (alreadyMatched) continue;

            const overlap = matchDoc.data().skillsToTeach.filter(s => skillsToLearn.includes(s));
            if (overlap.length === 0) continue;

            await addDoc(collection(db, 'matches'), {
                user1: uid,
                user2: matchDoc.id,
                skillOverlap: overlap,
                createdAt: serverTimestamp(),
                status: 'pending',
                notified: false
            });

            matches.push({ matchedUserId: matchDoc.id, skillOverlap: overlap });
        }
    }

    return matches;
};

// kullanicinin tum matchlerini getir
export const getMatchesForUser = async (uid) => {
    const q1 = query(collection(db, 'matches'), where('user1', '==', uid));
    const q2 = query(collection(db, 'matches'), where('user2', '==', uid));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const results = [];
    snap1.forEach(d => results.push({ id: d.id, ...d.data() }));
    snap2.forEach(d => results.push({ id: d.id, ...d.data() }));

    return results;
};

// TODO: cloud function'da yapilacak
export const notifyMatch = async (token1, token2, skill) => {
    // FCM bildirimi cloud function tarafinda gonderilecek
};

// manuel match istegi gonder
export const sendMatchRequest = async (fromUserId, toUserId) => {
    const existing = await checkExistingMatch(fromUserId, toUserId);
    if (existing) throw new Error('Zaten eşleşme var');

    const matchRef = await addDoc(collection(db, 'matches'), {
        user1: fromUserId,
        user2: toUserId,
        skillOverlap: [],
        createdAt: serverTimestamp(),
        status: 'pending',
        notified: false,
        isManual: true
    });
    return matchRef.id;
};

// match isteğini kabul et
export const acceptMatchRequest = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
    });
};

// match isteğini reddet
export const rejectMatchRequest = async (matchId) => {
    await deleteDoc(doc(db, 'matches', matchId));
};

// bekleyen match isteklerini getir
export const getPendingMatchRequests = async (userId) => {
    const q = query(
        collection(db, 'matches'),
        where('user2', '==', userId),
        where('status', '==', 'pending'),
        where('isManual', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
