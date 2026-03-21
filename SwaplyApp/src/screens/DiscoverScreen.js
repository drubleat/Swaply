import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, SafeAreaView
} from 'react-native';
import * as Location from 'expo-location';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import UserCard from '../components/UserCard';

const CATEGORIES = [
  'Tümü', 'Yazılım', 'Grafik Tasarım', 'Müzik',
  'Spor', 'Yabancı Dil', 'Matematik', 'Fotoğrafçılık', 'Video Düzenleme'
];

const DiscoverScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Konum al (izin isteme olmadan sessizce dene)
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
      }
    })();
  }, []);

  // Kategori değişince kullanıcıları yeniden çek
  useEffect(() => {
    fetchUsers(selectedCategory);
  }, [selectedCategory]);

  const fetchUsers = async (category) => {
    setLoading(true);
    try {
      const currentUid = auth.currentUser?.uid;
      const usersRef = collection(db, 'users');
      let q;

      if (category === 'Tümü') {
        q = query(usersRef, limit(30));
      } else {
        q = query(
          usersRef,
          where('skillsToTeach', 'array-contains', category),
          limit(30)
        );
      }

      const snapshot = await getDocs(q);
      const result = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== currentUid); // Kendini gösterme

      setUsers(result);
    } catch (error) {
      console.log('Kullanıcılar yüklenemedi:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Arama filtresi (client-side)
  const filteredUsers = users.filter(user => {
    if (!searchText.trim()) return true;
    const text = searchText.toLowerCase();
    const nameMatch = user.displayName?.toLowerCase().includes(text);
    const skillMatch = user.skillsToTeach?.some(s => s.toLowerCase().includes(text));
    const learnMatch = user.skillsToLearn?.some(s => s.toLowerCase().includes(text));
    return nameMatch || skillMatch || learnMatch;
  });

  const handleCardPress = (user) => {
    // İleride UserProfileScreen'e navigate edilecek
    navigation.navigate('UserProfile', { userId: user.id });
  };

  const renderHeader = () => (
    <View>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Beceri veya kullanıcı ara..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Kategori filtreleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sonuç sayısı */}
      {!loading && (
        <Text style={styles.resultsCount}>
          {filteredUsers.length} kişi bulundu
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
        <Text style={styles.emptySubtitle}>
          {searchText
            ? `"${searchText}" aramasına uygun kimse yok`
            : `"${selectedCategory}" kategorisinde henüz kimse yok`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keşfet</Text>
      </View>

      {/* İçerik */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              currentUserLocation={currentLocation}
              onPress={() => handleCardPress(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    padding: 0,
  },
  clearIcon: {
    fontSize: 15,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsCount: {
    fontSize: 13,
    color: '#6B7280',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DiscoverScreen;
