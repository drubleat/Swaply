import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert, Image
} from 'react-native';
import * as Location from 'expo-location';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { updateProfile, validateProfileUpdates } from '../services/profileService';
import { pickImage } from '../services/storageService';

const SKILLS = [
    'Yazılım', 'Grafik Tasarım', 'Müzik', 'Spor',
    'Yabancı Dil', 'Matematik', 'Fotoğrafçılık', 'Video Düzenleme',
    'Yemek Pişirme', 'Dans', 'Resim', 'Yazarlık'
];

const EditProfileScreen = ({ navigation }) => {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [selectedTeachSkills, setSelectedTeachSkills] = useState([]);
    const [selectedLearnSkills, setSelectedLearnSkills] = useState([]);
    const [photoURL, setPhotoURL] = useState('');
    const [newPhotoUri, setNewPhotoUri] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const currentUser = auth.currentUser;

    useEffect(() => {
        loadCurrentProfile();
    }, []);

    const loadCurrentProfile = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setDisplayName(data.displayName || '');
                setBio(data.bio || '');
                setSelectedTeachSkills(data.skillsToTeach || []);
                setSelectedLearnSkills(data.skillsToLearn || []);
                setPhotoURL(data.photoURL || '');
            }
        } catch (error) {
            console.log('Profil yuklenemedi:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSkill = (skill, type) => {
        if (type === 'teach') {
            setSelectedTeachSkills(prev =>
                prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
            );
        } else {
            setSelectedLearnSkills(prev =>
                prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
            );
        }
    };

    const handlePhotoSelect = async () => {
        try {
            const uri = await pickImage();
            if (uri) {
                setNewPhotoUri(uri);
            }
        } catch (error) {
            Alert.alert('Hata', error.message);
        }
    };

    const handleSave = async () => {
        const updates = {
            displayName: displayName.trim(),
            bio: bio.trim(),
            skillsToTeach: selectedTeachSkills,
            skillsToLearn: selectedLearnSkills,
        };

        if (newPhotoUri) {
            updates.newPhotoUri = newPhotoUri;
        }

        try {
            validateProfileUpdates(updates);
        } catch (error) {
            Alert.alert('Hata', error.message);
            return;
        }

        setSaving(true);
        try {
            await updateProfile(currentUser.uid, updates);
            Alert.alert('Başarılı', 'Profil güncellendi!', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', error.message);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    const renderSkillChips = (selectedSkills, type) => {
        const selected = selectedSkills;
        const unselected = SKILLS.filter(s => !selectedSkills.includes(s));

        return (
            <>
                {selected.length > 0 && (
                    <View style={styles.chipsContainer}>
                        {selected.map(skill => (
                            <TouchableOpacity
                                key={skill}
                                style={styles.chipSelected}
                                onPress={() => toggleSkill(skill, type)}
                            >
                                <Text style={styles.chipSelectedText}>{skill} ✕</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {unselected.length > 0 && (
                    <View style={styles.chipsContainer}>
                        {unselected.map(skill => (
                            <TouchableOpacity
                                key={skill}
                                style={styles.chip}
                                onPress={() => toggleSkill(skill, type)}
                            >
                                <Text style={styles.chipText}>+ {skill}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    const displayPhotoUri = newPhotoUri || photoURL;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profili Düzenle</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoSelect}>
                    {displayPhotoUri ? (
                        <Image source={{ uri: displayPhotoUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                        </View>
                    )}
                    <View style={styles.cameraIcon}>
                        <Text style={styles.cameraEmoji}>📷</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>AD SOYAD</Text>
                <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Ad Soyad"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.sectionLabel}>HAKKIMDA</Text>
                <View style={styles.bioContainer}>
                    <TextInput
                        style={styles.bioInput}
                        value={bio}
                        onChangeText={(text) => {
                            if (text.length <= 150) setBio(text);
                        }}
                        placeholder="Kendinden bahset..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        maxLength={150}
                    />
                    <Text style={styles.charCounter}>{bio.length}/150</Text>
                </View>

                <Text style={styles.sectionLabel}>ÖĞRETEBİLECEĞİM YETENEKLER</Text>
                {renderSkillChips(selectedTeachSkills, 'teach')}

                <Text style={styles.sectionLabel}>ÖĞRENMEK İSTEDİĞİM YETENEKLER</Text>
                {renderSkillChips(selectedLearnSkills, 'learn')}

                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Kaydet</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        padding: 6,
        width: 40,
    },
    backIcon: {
        fontSize: 22,
        color: '#1F2937',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    avatarCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    avatarText: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#7C3AED',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    cameraEmoji: {
        fontSize: 16,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
        marginTop: 16,
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
    },
    bioContainer: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    bioInput: {
        padding: 14,
        fontSize: 15,
        color: '#1F2937',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCounter: {
        textAlign: 'right',
        paddingRight: 14,
        paddingBottom: 10,
        color: '#9CA3AF',
        fontSize: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    chip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    chipSelected: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C4B5FD',
    },
    chipSelectedText: {
        fontSize: 13,
        color: '#7C3AED',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
