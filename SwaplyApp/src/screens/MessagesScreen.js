import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  ActivityIndicator, StatusBar, SafeAreaView, TouchableOpacity
} from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import ChatListItem from '../components/ChatListItem';

const MessagesScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const chatsRef = collection(db, 'chats');

      // participants dizisinde currentUser olan tüm chatler
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(result);
    } catch (error) {
      console.log('Chatler yüklenemedi:', error.message);
      // Index hatası veya boş koleksiyon durumunda boş liste göster
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  // Mesaj araması için filtre
  const filteredChats = chats.filter(chat => {
    if (!searchText.trim()) return true;
    // lastMessage veya katılımcı adı içinde arama (ChatListItem'de isim yükleniyor)
    return chat.lastMessage?.toLowerCase().includes(searchText.toLowerCase());
  });

  const handleChatPress = (chat) => {
    navigation.navigate('ChatDetail', {
      chatId: chat.id,
      participants: chat.participants,
    });
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>Henüz mesajın yok</Text>
        <Text style={styles.emptySubtitle}>
          Keşfet sekmesinden yetenek sahiplerini bul ve takas başlat!
        </Text>
        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => navigation.navigate('Discover')}
          activeOpacity={0.8}
        >
          <Text style={styles.discoverButtonText}>Keşfete Git →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlar</Text>
      </View>

      {/* Arama */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Mesajlarda ara..."
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

      {/* Liste */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              currentUserId={currentUser?.uid}
              onPress={() => handleChatPress(item)}
            />
          )}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredChats.length === 0 ? styles.emptyList : null}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#8B5CF6',
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
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 86, // Avatar genişliği + margin
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
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 52,
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
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default MessagesScreen;
