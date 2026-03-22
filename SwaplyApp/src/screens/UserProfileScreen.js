import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, StatusBar, Alert
} from 'react-native';
import {
  doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { calculateDistance } from '../utils/locationUtils';
import SkillChip from '../components/SkillChip';
import { canRateUser } from '../services/ratingService';
import { sendMatchRequest, checkExistingMatch } from '../services/matchService';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const currentUser = auth.currentUser;

  const [profileUser, setProfileUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [existingChatId, setExistingChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [canMatch, setCanMatch] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const rateAllowed = await canRateUser(currentUser.uid, userId);
        setCanRate(rateAllowed);
        const matchExists = await checkExistingMatch(currentUser.uid, userId);
        setCanMatch(!matchExists);
      } catch (e) {
        console.log('Izin kontrol hatasi:', e.message);
      }
    };
    checkPermissions();
  }, [userId]);

  const loadData = async () => {
    try {
      // Hedef kullanıcı profili
      const targetDoc = await getDoc(doc(db, 'users', userId));
      if (targetDoc.exists()) {
        setProfileUser({ id: targetDoc.id, ...targetDoc.data() });
      }

      // Mevcut kullanıcı verisi (yetenekler için)
      const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (myDoc.exists()) {
        setCurrentUserData(myDoc.data());
      }

      // Mevcut sohbet var mı kontrol et
      const chatId = await checkExistingChat(currentUser.uid, userId);
      setExistingChatId(chatId);
    } catch (e) {
      console.log('Profil yüklenemedi:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // İki kullanıcı arasında sohbet var mı?
  const checkExistingChat = async (currentUid, otherUid) => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUid));
    const snapshot = await getDocs(q);
    const found = snapshot.docs.find(d => d.data().participants.includes(otherUid));
    return found ? found.id : null;
  };

  // Yeni sohbet oluştur
  const createChat = async () => {
    const chatsRef = collection(db, 'chats');
    const chatDoc = await addDoc(chatsRef, {
      participants: [currentUser.uid, userId],
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
    });
    return chatDoc.id;
  };

  // mesaj gonder / sohbeti ac
  const handleMessagePress = async () => {
    setChatLoading(true);
    try {
      let chatId = existingChatId;
      if (!chatId) {
        chatId = await createChat();
        setExistingChatId(chatId);
      }
      navigation.navigate('ChatDetail', {
        chatId,
        participants: [currentUser.uid, userId],
      });
    } catch (e) {
      Alert.alert('Hata', 'Sohbet başlatılamadı. Lütfen tekrar deneyin.');
      console.log('Sohbet hatası:', e.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRatePress = () => {
    navigation.navigate('Rating', {
      userId: userId,
      userName: profileUser.displayName,
    });
  };

  const handleMatchRequest = async () => {
    setMatchLoading(true);
    try {
      await sendMatchRequest(currentUser.uid, userId);
      Alert.alert('Başarılı', 'Eşleşme isteği gönderildi!');
      setCanMatch(false);
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setMatchLoading(false);
    }
  };


  const getDistance = () => {
    if (!currentUserData?.location || !profileUser?.location) return null;
    const myLoc = currentUserData.location;
    const theirLoc = profileUser.location;
    const dist = calculateDistance(
      myLoc.latitude ?? myLoc.lat,
      myLoc.longitude ?? myLoc.lng,
      theirLoc.latitude ?? theirLoc.lat,
      theirLoc.longitude ?? theirLoc.lng
    );
    if (dist < 1) return `${Math.round(dist * 1000)} m`;
    return `${dist.toFixed(1)} km`;
  };

  // Yetenek eşleşmelerini bul
  const getSkillMatches = () => {
    if (!currentUserData || !profileUser) return [];
    const myTeach = currentUserData.skillsToTeach || [];
    const theirLearn = profileUser.skillsToLearn || [];
    const theirTeach = profileUser.skillsToTeach || [];
    const myLearn = currentUserData.skillsToLearn || [];

    const matches = [];
    // Ben öğretebilir, o öğrenmek istiyor
    myTeach.forEach(s => { if (theirLearn.includes(s)) matches.push({ skill: s, type: 'myTeach' }); });
    // O öğretebilir, ben öğrenmek istiyorum
    theirTeach.forEach(s => { if (myLearn.includes(s)) matches.push({ skill: s, type: 'theirTeach' }); });
    return matches;
  };

  // Yıldız render
  const renderStars = (rating) => {
    const r = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, i < r ? styles.starFull : styles.starEmpty]}>
        {i < r ? '★' : '☆'}
      </Text>
    ));
  };

  // İsim baş harfleri
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Kullanıcı bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const distance = getDistance();
  const skillMatches = getSkillMatches();
  const teachSkills = profileUser.skillsToTeach || [];
  const learnSkills = profileUser.skillsToLearn || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileUser.displayName?.split(' ')[0]}'in Profili</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Avatar & Kimlik */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profileUser.displayName)}</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.name}>{profileUser.displayName}</Text>

          {distance && (
            <Text style={styles.location}>📍 {distance} uzakta</Text>
          )}

          {profileUser.bio ? (
            <Text style={styles.bio}>{profileUser.bio}</Text>
          ) : null}

          {/* Rating & Takas */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileUser.swapCount || 0}</Text>
              <Text style={styles.statLabel}>TAKAS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                {renderStars(profileUser.rating)}
              </View>
              <Text style={styles.statLabel}>
                {(profileUser.rating || 0).toFixed(1)} PUAN
              </Text>
            </View>
          </View>
        </View>

        {/* Yetenek Eşleşmesi */}
        {skillMatches.length > 0 && (
          <View style={styles.matchBox}>
            <Text style={styles.matchTitle}>✨ Harika Bir Eşleşme!</Text>
            {skillMatches.map((m, i) => (
              <Text key={i} style={styles.matchItem}>
                {m.type === 'myTeach'
                  ? `• Sen öğretiyorsun, o öğrenmek istiyor: ${m.skill}`
                  : `• O öğretiyor, sen öğrenmek istiyorsun: ${m.skill}`}
              </Text>
            ))}
            <Text style={styles.matchCta}>Birbirinizden öğrenebilirsiniz! 🎉</Text>
          </View>
        )}

        {/* Öğrettikleri */}
        {teachSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Neler Öğretebilir?</Text>
            <View style={styles.chipsWrap}>
              {teachSkills.map((s, i) => <SkillChip key={i} skill={s} variant="teach" />)}
            </View>
          </View>
        )}

        {/* Öğrenmek İstedikleri */}
        {learnSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Neler Öğrenmek İstiyor?</Text>
            <View style={styles.chipsWrap}>
              {learnSkills.map((s, i) => <SkillChip key={i} skill={s} variant="learn" />)}
            </View>
          </View>
        )}

        {/* Boşluk (alt buton için) */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Alt Aksiyon Butonu */}
      <View style={styles.actionBar}>
        {canMatch && (
          <TouchableOpacity
            style={styles.matchBtn}
            onPress={handleMatchRequest}
            disabled={matchLoading}
            activeOpacity={0.85}
          >
            {matchLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.matchBtnText}>✨ Eşleş</Text>
            )}
          </TouchableOpacity>
        )}
        {canRate && (
          <TouchableOpacity
            style={styles.rateBtn}
            onPress={handleRatePress}
            activeOpacity={0.85}
          >
            <Text style={styles.rateBtnText}>⭐ Değerlendir</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.messageBtn, chatLoading && styles.messageBtnLoading]}
          onPress={handleMessagePress}
          disabled={chatLoading}
          activeOpacity={0.85}
        >
          {chatLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.messageBtnText}>
              {existingChatId ? '💬 Sohbet' : '💬 Mesaj'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    paddingBottom: 20,
  },

  // Profil başlık
  profileHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C4B5FD',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 18,
  },
  starFull: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: '#D1D5DB',
  },

  // Eşleşme kutusu
  matchBox: {
    margin: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6D28D9',
    marginBottom: 8,
  },
  matchItem: {
    fontSize: 13,
    color: '#5B21B6',
    marginBottom: 4,
    lineHeight: 18,
  },
  matchCta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 6,
  },

  // Yetenekler
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Alt mesaj buton alani
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    gap: 10,
  },
  rateBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  matchBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  matchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  messageBtn: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageBtnFull: {
    flex: 2,
  },
  messageBtnLoading: {
    opacity: 0.75,
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default UserProfileScreen;
