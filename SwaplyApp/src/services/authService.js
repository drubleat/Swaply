import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// kullanici kaydi - sadece edu.tr maili kabul ediyor
export const registerUser = async (email, password, displayName = '') => {
    if (!email.endsWith('@edu.tr') && !email.includes('.edu.tr')) {
        throw new Error('Sadece .edu.tr uzantılı mail adresleri kabul edilir.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;



    // kullanici belgesini olustur, firestore hazir degilse hata almasin
    try {
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
    } catch (e) {
        console.log('firestore yazma hatasi:', e.message);
    }

    return user;
};

// profil guncelleme - kayit sonrasi profil bilgilerini yaziyoruz
export const updateUserProfile = async (uid, profileData) => {
    await updateDoc(doc(db, 'users', uid), {
        displayName: profileData.displayName,
        bio: profileData.bio || '',
        skillsToTeach: profileData.skillsToTeach,
        skillsToLearn: profileData.skillsToLearn,
        location: profileData.location || { latitude: 0, longitude: 0 },
        rating: 0,
        swapCount: 0,
        createdAt: serverTimestamp()
    });
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
export const deleteAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Delete any user's matches (optional - for cleanup)
    const matchesRef = collection(db, 'matches');
    const q1 = query(matchesRef, where('userAId', '==', user.uid));
    const q2 = query(matchesRef, where('userBId', '==', user.uid));
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    const deletePromises = [];
    snapshot1.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
    snapshot2.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
    
    await Promise.all(deletePromises);
    
    // Delete Firebase Auth user
    await user.delete();
    
    return { success: true };
    
  } catch (error) {
    console.error('Delete account error:', error);
    return { success: false, error: error.message };
  }
};
