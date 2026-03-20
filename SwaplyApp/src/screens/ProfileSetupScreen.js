import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import { updateUserProfile } from '../services/authService';
import { auth } from '../services/firebaseConfig';

const SKILLS = [
  'Yazılım', 'Grafik Tasarım', 'Müzik', 'Spor',
  'Yabancı Dil', 'Matematik', 'Fotoğrafçılık', 'Video Düzenleme'
];

export default function ProfileSetupScreen({ navigation, route }) {
  const user = auth.currentUser;
  const passedName = route.params?.displayName || user?.displayName || '';

  const [displayName, setDisplayName] = useState(passedName);
  const [bio, setBio] = useState('');
  const [selectedTeachSkills, setSelectedTeachSkills] = useState([]);
  const [selectedLearnSkills, setSelectedLearnSkills] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null); // 'granted' | 'denied'
  const [loading, setLoading] = useState(false);

  // TODO: Add profile image upload later

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

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        Alert.alert('Konum izni reddedildi');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setLocationStatus('granted');
      console.log('Konum alindi:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log('Konum hatasi:', error);
      Alert.alert('Hata', 'Konum alınırken bir hata oluştu.');
    }
  };

  const handleComplete = async () => {
    // validasyonlar
    if (!displayName.trim()) {
      Alert.alert('Hata', 'Lütfen adını gir');
      return;
    }
    if (selectedTeachSkills.length === 0) {
      Alert.alert('Hata', 'En az bir öğretebileceğin yetenek seç');
      return;
    }
    if (selectedLearnSkills.length === 0) {
      Alert.alert('Hata', 'En az bir öğrenmek istediğin yetenek seç');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        skillsToTeach: selectedTeachSkills,
        skillsToLearn: selectedLearnSkills,
        location: userLocation || { latitude: 0, longitude: 0 },
      };

      await updateUserProfile(user.uid, profileData);
      console.log('Profil olusturuldu:', user.uid);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      Alert.alert('Başarılı', 'Profil oluşturuldu!');
    } catch (error) {
      console.log('Profil hatasi:', error.message);
      Alert.alert('Hata', `Profil oluşturulurken hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedChips = (selectedSkills, type) => {
    return (
      <View style={styles.chipsContainer}>
        {selectedSkills.map(skill => (
          <TouchableOpacity
            key={skill}
            style={styles.chipSelected}
            onPress={() => toggleSkill(skill, type)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipSelectedText}>{skill}  ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSelectableChips = (selectedSkills, type) => {
    const unselected = SKILLS.filter(s => !selectedSkills.includes(s));
    if (unselected.length === 0) return null;
    return (
      <View style={styles.chipsContainer}>
        {unselected.map(skill => (
          <TouchableOpacity
            key={skill}
            style={styles.chip}
            onPress={() => toggleSkill(skill, type)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>+ {skill}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.6}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profilini Oluştur</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.cameraIcon}>
            <Text style={styles.cameraEmoji}>📷</Text>
          </View>
        </View>

        {/* Display Name */}
        <Text style={styles.displayNameText}>{displayName || 'Ad Soyad'}</Text>

        {/* Name Edit */}
        <Text style={styles.sectionLabel}>AD SOYAD</Text>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          placeholderTextColor="#9CA3AF"
          value={displayName}
          onChangeText={setDisplayName}
        />

        {/* Bio / Hakkımda */}
        <Text style={styles.sectionLabel}>HAKKIMDA</Text>
        <View style={styles.bioContainer}>
          <TextInput
            style={styles.bioInput}
            placeholder="Kendinden, ilgi alanlarından ve takas yapmak istediğin konulardan bahset..."
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={(text) => {
              if (text.length <= 150) setBio(text);
            }}
            multiline
            maxLength={150}
          />
          <Text style={styles.charCounter}>{bio.length}/150</Text>
        </View>

        {/* Skills to Teach */}
        <Text style={styles.sectionLabel}>ÖĞRETEBİLECEĞİM YETENEKLER</Text>
        {selectedTeachSkills.length > 0 && renderSelectedChips(selectedTeachSkills, 'teach')}
        {renderSelectableChips(selectedTeachSkills, 'teach')}

        {/* Skills to Learn */}
        <Text style={styles.sectionLabel}>ÖĞRENMEK İSTEDİĞİM YETENEKLER</Text>
        {selectedLearnSkills.length > 0 && renderSelectedChips(selectedLearnSkills, 'learn')}
        {renderSelectableChips(selectedLearnSkills, 'learn')}

        {/* Location */}
        <Text style={styles.sectionLabel}>KONUM</Text>
        <TouchableOpacity
          style={[
            styles.locationButton,
            locationStatus === 'granted' && styles.locationButtonSuccess,
            locationStatus === 'denied' && styles.locationButtonDenied
          ]}
          onPress={getLocation}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.locationButtonText,
            locationStatus === 'granted' && styles.locationButtonTextSuccess,
            locationStatus === 'denied' && styles.locationButtonTextDenied
          ]}>
            {locationStatus === 'granted'
              ? '✓ Konum alındı'
              : locationStatus === 'denied'
                ? '✗ Konum izni reddedildi'
                : '📍 Konumumu Paylaş'}
          </Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ height: 30 }} />

        {/* Complete Button */}
        <TouchableOpacity
          style={[styles.completeButton, loading && { opacity: 0.7 }]}
          onPress={handleComplete}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.completeButtonText}>Profili Kaydet</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: '#1F2937',
    fontWeight: '300',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  avatarEmoji: {
    fontSize: 44,
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
    color: '#FFFFFF',
  },
  displayNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
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
    minHeight: 110,
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
  locationButton: {
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#F5F3FF',
  },
  locationButtonSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  locationButtonDenied: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  locationButtonText: {
    fontSize: 15,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  locationButtonTextSuccess: {
    color: '#10B981',
  },
  locationButtonTextDenied: {
    color: '#EF4444',
  },
  completeButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
