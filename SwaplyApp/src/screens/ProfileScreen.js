import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { logoutUser } from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.displayName?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{userData.displayName}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Text style={styles.rating}>⭐ {userData.rating || 0} · {userData.swapCount || 0} takas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Öğretebileceğim Yetenekler:</Text>
        <View style={styles.skillsContainer}>
          {userData.skillsToTeach?.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Öğrenmek İstediklerim:</Text>
        <View style={styles.skillsContainer}>
          {userData.skillsToLearn?.map((skill, index) => (
            <View key={index} style={[styles.skillChip, styles.learnChip]}>
              <Text style={styles.learnText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsText}>⚙️ Ayarlar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        📝 Ayarlar ve profil düzenleme{'\n'}
        Arda Burak ve Furkan tarafından eklenecek.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5
  },
  rating: {
    fontSize: 14,
    color: '#6B7280'
  },
  section: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  skillChip: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  skillText: {
    color: '#FFFFFF',
    fontSize: 14
  },
  learnChip: {
    backgroundColor: '#E5E7EB'
  },
  learnText: {
    color: '#1F2937',
    fontSize: 14
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  note: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 30
  },
  settingsButton: {
    margin: 20,
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  settingsText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ProfileScreen;
