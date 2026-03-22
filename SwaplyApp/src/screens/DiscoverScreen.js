import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, SafeAreaView,
  RefreshControl
} from 'react-native';
import * as Location from 'expo-location';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { getMatchesForUser } from '../services/matchService';
import { calculateDistance } from '../utils/locationUtils';
import UserCard from '../components/UserCard';
import { getUnreadMatchCount } from '../services/notificationService';
import { saveSearchTerm, getSearchHistory } from '../utils/searchHistory';
import UserCardSkeleton from '../components/UserCardSkeleton';

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
  const [myMatches, setMyMatches] = useState([]);
  const [maxDistance, setMaxDistance] = useState(null);
  const [unreadMatchCount, setUnreadMatchCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

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

  useEffect(() => {
    loadUnreadMatches();
    loadSearchHistory();
  }, []);

  const loadUnreadMatches = async () => {
    const count = await getUnreadMatchCount(auth.currentUser?.uid);
    setUnreadMatchCount(count);
    
    navigation.setOptions({
        tabBarBadge: count > 0 ? count : null,
    });
  };

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  // refresh after viewing
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        loadUnreadMatches();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(selectedCategory);
    await loadUnreadMatches();
    setRefreshing(false);
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim().length > 2) {
        await saveSearchTerm(text.trim());
        await loadSearchHistory();
    }
  };

  // match listesini yukle
  useEffect(() => {
    const loadMyMatches = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const data = await getMatchesForUser(uid);
        setMyMatches(data);
      } catch (e) {
        console.log('Match listesi yuklenemedi:', e.message);
      }
    };
    loadMyMatches();
  }, []);

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

  // kart icin match kontrolu
  const isMatched = (userId) =>
    myMatches.some(m => m.user1 === userId || m.user2 === userId);

  // arama + mesafe filtresi
  const filteredUsers = users.filter(user => {
    if (searchText.trim()) {
      const text = searchText.toLowerCase();
      const nameMatch = user.displayName?.toLowerCase().includes(text);
      const skillMatch = user.skillsToTeach?.some(s => s.toLowerCase().includes(text));
      const learnMatch = user.skillsToLearn?.some(s => s.toLowerCase().includes(text));
      if (!nameMatch && !skillMatch && !learnMatch) return false;
    }
    if (maxDistance && currentLocation && user.location) {
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        user.location.latitude ?? user.location.lat,
        user.location.longitude ?? user.location.lng
      );
      if (dist > maxDistance) return false;
    }
    return true;
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
          onChangeText={handleSearch}
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {searchText === '' && searchHistory.length > 0 && (
          <View style={styles.searchHistoryContainer}>
              {searchHistory.map((term, index) => (
                  <TouchableOpacity
                      key={index}
                      style={styles.historyItem}
                      onPress={() => setSearchText(term)}
                  >
                      <Text style={styles.historyIcon}>🕐</Text>
                      <Text style={styles.historyText}>{term}</Text>
                  </TouchableOpacity>
              ))}
          </View>
      )}

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

      {/* Mesafe filtresi */}
      <View style={styles.distanceFilters}>
        <Text style={styles.filterLabel}>Mesafe:</Text>
        {[null, 3, 5, 10].map((dist) => (
          <TouchableOpacity
            key={dist || 'all'}
            style={[styles.distChip, maxDistance === dist && styles.distChipActive]}
            onPress={() => setMaxDistance(dist)}
            activeOpacity={0.7}
          >
            <Text style={[styles.distChipText, maxDistance === dist && styles.distChipTextActive]}>
              {dist ? `${dist} km` : 'Tümü'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    
    const isSearching = searchText.trim().length > 0;
    const isFiltered = selectedCategory !== 'Tümü';
    
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
                {isSearching ? '🔍' : isFiltered ? '📂' : '🌟'}
            </Text>
            <Text style={styles.emptyTitle}>
                {isSearching 
                    ? 'Sonuç Bulunamadı' 
                    : isFiltered 
                        ? 'Bu Kategoride Kimse Yok'
                        : 'Henüz Kullanıcı Yok'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {isSearching 
                    ? `"${searchText}" aramasına uygun kimse yok. Farklı kelimeler dene.`
                    : isFiltered
                        ? `"${selectedCategory}" kategorisinde henüz kimse yok. Başka kategorilere bak.`
                        : 'Arkadaşlarını davet et ve yeteneklerini paylaş!'}
            </Text>
            
            {(isSearching || isFiltered) && (
                <TouchableOpacity
                    style={styles.clearFiltersBtn}
                    onPress={() => {
                        setSearchText('');
                        setSelectedCategory('Tümü');
                    }}
                >
                    <Text style={styles.clearFiltersBtnText}>Filtreleri Temizle</Text>
                </TouchableOpacity>
            )}
        </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
        <View style={{ marginTop: 16 }}>
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Keşfet</Text>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.8}
          >
            <Text style={styles.mapBtnText}>🗺️ Harita</Text>
          </TouchableOpacity>
        </View>
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
              isMatched={isMatched(item.id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
              <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#8B5CF6"
                  colors={['#8B5CF6']}
              />
          }
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mapBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  distanceFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  distChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distChipActive: {
    backgroundColor: '#8B5CF6',
  },
  distChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  distChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clearFiltersBtn: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
  },
  clearFiltersBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
  },
  searchHistoryContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
  },
  historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
  },
  historyIcon: {
      marginRight: 8,
  },
  historyText: {
      color: '#4B5563',
      fontSize: 14,
  },
});

export default DiscoverScreen;
