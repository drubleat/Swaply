import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

// fotografı sec
export const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
        throw new Error('Galeri izni gerekli');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
    });

    if (result.canceled) {
        return null;
    }

    return result.assets[0].uri;
};

// fotografı upload et
export const uploadProfilePhoto = async (userId, imageUri) => {
    try {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const filename = `profile_${Date.now()}.jpg`;
        const storageRef = ref(storage, `profile_photos/${userId}/${filename}`);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.log('Upload hatası:', error.message);
        throw error;
    }
};

// eski fotografı sil
export const deleteProfilePhoto = async (photoURL) => {
    try {
        const photoRef = ref(storage, photoURL);
        await deleteObject(photoRef);
    } catch (error) {
        console.log('Silme hatası:', error.message);
    }
};
