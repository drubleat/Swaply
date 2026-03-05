import { collection, doc, getDoc, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// kullanicinin skillsToLearn'une gore eslesen kullanicilari bul
export const findMatches = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) throw new Error('Kullanıcı bulunamadı');

    const userData = userDoc.data();
    const skillsToLearn = userData.skillsToLearn;

    if (!skillsToLearn || skillsToLearn.length === 0) return [];

    const matches = [];

    for (const skill of skillsToLearn) {
        const q = query(
            collection(db, 'users'),
            where('skillsToTeach', 'array-contains', skill)
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((matchDoc) => {
            if (matchDoc.id === uid) return;

            const overlap = matchDoc.data().skillsToTeach.filter(s => skillsToLearn.includes(s));

            matches.push({
                matchedUserId: matchDoc.id,
                skillOverlap: overlap
            });
        });
    }

    // tekrar eden eslesmeler varsa kaldir
    const unique = [];
    const seen = new Set();
    for (const m of matches) {
        if (!seen.has(m.matchedUserId)) {
            seen.add(m.matchedUserId);
            unique.push(m);
        }
    }

    // eslesmeler firestore'a yaziliyor
    for (const match of unique) {
        await addDoc(collection(db, 'matches'), {
            user1: uid,
            user2: match.matchedUserId,
            skillOverlap: match.skillOverlap,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
    }

    return unique;
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
