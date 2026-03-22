import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import MessageBubble from '../components/MessageBubble';
import Avatar from '../components/Avatar';

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatId, participants } = route.params;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef(null);

  // Diğer kullanıcının bilgilerini yükle
  useEffect(() => {
    const loadOtherUser = async () => {
      const otherId = participants?.find(p => p !== currentUser.uid);
      if (!otherId) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', otherId));
        if (userDoc.exists()) {
          setOtherUser({ id: userDoc.id, ...userDoc.data() });
        }
      } catch (e) {
        console.log('Kullanıcı yüklenemedi:', e.message);
      }
    };
    loadOtherUser();
  }, []);

  // FR4 — Gerçek zamanlı mesaj dinleyici (onSnapshot)
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);
      // Yeni mesajda en alta kaydır
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, (error) => {
      console.log('Mesaj dinleme hatası:', error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Mesaj gönder
  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || sending) return;

    setSending(true);
    setMessageText(''); // Optimistik temizle

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        text,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Chat dokümanını son mesajla güncelle
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
      });
    } catch (e) {
      console.log('Mesaj gönderme hatası:', e.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => (
    <MessageBubble message={item} currentUserId={currentUser.uid} />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👋</Text>
        <Text style={styles.emptyText}>Henüz mesaj yok. İlk mesajı gönder!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => otherUser && navigation.navigate('UserProfile', { userId: otherUser.id })}
          activeOpacity={0.7}
        >
          <View style={styles.headerAvatarContainer}>
            <Avatar photoURL={otherUser?.photoURL} displayName={otherUser?.displayName} size={40} fontSize={15} />
          </View>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.displayName || 'Yükleniyor...'}
            </Text>
            <Text style={styles.headerSubtitle}>Swaply</Text>
          </View>
        </TouchableOpacity>

        {/* Profil gezintisi için → butonu */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => otherUser && navigation.navigate('UserProfile', { userId: otherUser.id })}
        >
          <Text style={styles.profileBtnText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Mesajlar */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Mesaj giriş alanı */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Mesaj yaz..."
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxHeight={100}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!messageText.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  backIcon: {
    fontSize: 22,
    color: '#1F2937',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarContainer: {
    marginRight: 4,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  profileBtn: {
    padding: 8,
  },
  profileBtnText: {
    fontSize: 22,
    color: '#6B7280',
    letterSpacing: 1,
  },

  // Mesajlar
  messagesList: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Giriş alanı
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ChatDetailScreen;
