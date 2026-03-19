import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, deleteUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// kullanici kaydi - sadece edu.tr maili kabul ediyor
export const registerUser = async (email, password, displayName = '') => {
    if (!email.endsWith('@edu.tr') && !email.includes('.edu.tr')) {
        throw new Error('Sadece .edu.tr uzantılı mail adresleri kabul edilir.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName,
        email: user.email,
        bio: '',
        photoURL: '',
        skillsToTeach: [],
        skillsToLearn: [],
        location: { lat: 0, lng: 0 },
        rating: 0,
        ratingCount: 0,
        fcmToken: ''
    });

    return user;
};

// giris
export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

// cikis
export const logoutUser = async () => {
    await signOut(auth);
};

// hesap silme
export const deleteAccount = async (uid) => {
    await deleteDoc(doc(db, 'users', uid));

    const user = auth.currentUser;
    if (user) {
        await deleteUser(user);
    }
};
