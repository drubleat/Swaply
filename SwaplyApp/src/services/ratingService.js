import {
    collection, addDoc, query, where, getDocs,
    doc, getDoc, updateDoc, serverTimestamp, increment
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// kullanici zaten rating vermis mi
const checkExistingRating = async (raterId, ratedUserId) => {
    const q = query(
        collection(db, 'ratings'),
        where('raterId', '==', raterId),
        where('ratedUserId', '==', ratedUserId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
};

// rating kaydet
export const submitRating = async (raterId, ratedUserId, rating, comment = '') => {
    const alreadyRated = await checkExistingRating(raterId, ratedUserId);
    if (alreadyRated) {
        throw new Error('Bu kullanıcıyı zaten değerlendirdin');
    }

    await addDoc(collection(db, 'ratings'), {
        raterId,
        ratedUserId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
    });

    // hedef kullanicinin ortalamasini guncelle
    await updateUserRating(ratedUserId);

    // her iki taraf icin swap sayisini artir
    await incrementSwapCount(raterId);
    await incrementSwapCount(ratedUserId);
};

// kullanicinin ortalama ratingini hesapla
export const updateUserRating = async (userId) => {
    const q = query(
        collection(db, 'ratings'),
        where('ratedUserId', '==', userId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.docs.length === 0) return;

    const ratings = snapshot.docs.map(d => d.data().rating);
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    await updateDoc(doc(db, 'users', userId), {
        rating: parseFloat(average.toFixed(1)),
        ratingCount: ratings.length
    });
};

// swap sayisini 1 artir
export const incrementSwapCount = async (userId) => {
    await updateDoc(doc(db, 'users', userId), {
        swapCount: increment(1)
    });
};

// kullanicinin aldigi ratingleri getir
export const getUserRatings = async (userId) => {
    const q = query(
        collection(db, 'ratings'),
        where('ratedUserId', '==', userId)
    );
    const snapshot = await getDocs(q);

    const ratings = await Promise.all(
        snapshot.docs.map(async (ratingDoc) => {
            const data = ratingDoc.data();
            const raterDoc = await getDoc(doc(db, 'users', data.raterId));
            return {
                id: ratingDoc.id,
                ...data,
                raterName: raterDoc.exists() ? raterDoc.data().displayName : 'Anonim'
            };
        })
    );
    return ratings;
};

// bu kullaniciyi puanlayabilir miyim
export const canRateUser = async (raterId, ratedUserId) => {
    const existing = await checkExistingRating(raterId, ratedUserId);
    return !existing;
};
