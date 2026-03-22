import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { uploadProfilePhoto, deleteProfilePhoto } from './storageService';
import { findMatches } from './matchService';

// profil guncelle
export const updateProfile = async (userId, updates) => {
    const userRef = doc(db, 'users', userId);
    
    // foto degisti mi
    if (updates.newPhotoUri) {
        const userDoc = await getDoc(userRef);
        const oldPhotoURL = userDoc.data()?.photoURL;
        
        // eski fotoyu sil
        if (oldPhotoURL) {
            try {
                await deleteProfilePhoto(oldPhotoURL);
            } catch (e) {
                console.log('Eski foto silinemedi:', e.message);
            }
        }
        
        // yeni fotoyu yukle
        const newPhotoURL = await uploadProfilePhoto(userId, updates.newPhotoUri);
        updates.photoURL = newPhotoURL;
        delete updates.newPhotoUri;
    }
    
    // firestore'u guncelle
    await updateDoc(userRef, updates);
    
    // yetenekler degistiyse match search yap
    if (updates.skillsToTeach || updates.skillsToLearn) {
        try {
            await findMatches(userId);
        } catch (e) {
            console.log('Match search hatası:', e.message);
        }
    }
};

// profil data validation
export const validateProfileUpdates = (updates) => {
    if (updates.displayName && updates.displayName.trim().length < 2) {
        throw new Error('İsim en az 2 karakter olmalı');
    }
    
    if (updates.bio && updates.bio.length > 150) {
        throw new Error('Bio 150 karakterden uzun olamaz');
    }
    
    if (updates.skillsToTeach && updates.skillsToTeach.length === 0) {
        throw new Error('En az bir öğretebileceğin yetenek seç');
    }
    
    if (updates.skillsToLearn && updates.skillsToLearn.length === 0) {
        throw new Error('En az bir öğrenmek istediğin yetenek seç');
    }
    
    return true;
};
