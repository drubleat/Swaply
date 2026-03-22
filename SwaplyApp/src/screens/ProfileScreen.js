import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { logoutUser } from '../services/authService';
import Avatar from '../components/Avatar';
import { getMatchesForUser } from '../services/matchService';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    loadUserData();
    loadMatchCount();
  }, []);

  const loadMatchCount = async () => {
    const matches = await getMatchesForUser(auth.currentUser.uid);
    setMatchCount(matches.length);
  };

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
        <Avatar photoURL={userData.photoURL} displayName={userData.displayName} size={80} fontSize={32} />
        <Text style={styles.name}>{userData.displayName}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Text style={styles.rating}>⭐ {userData.rating || 0} · {userData.ratingCount || 0} değerlendirme</Text>
        
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData.swapCount || 0}</Text>
                <Text style={styles.statLabel}>TAKAS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{matchCount}</Text>
                <Text style={styles.statLabel}>EŞLEŞME</Text>
            </View>
        </View>
      </View>

      <View style={styles.quickActions}>
          <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('EditProfile')}
          >
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionText}>Düzenle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Discover')}
          >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Keşfet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Settings')}
          >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Ayarlar</Text>
          </TouchableOpacity>
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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 40,
    width: '100%',
    justifyContent: 'center',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '100%',
  },
  quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
  },
  actionBtn: {
      alignItems: 'center',
      gap: 6,
  },
  actionIcon: {
      fontSize: 24,
  },
  actionText: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
  }
});

export default ProfileScreen;
