import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { formatTimeAgo, formatTime } from '../utils/timeUtils';

const ChatListItem = ({ chat, currentUserId, onPress }) => {
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    loadOtherUser();
  }, []);

  const loadOtherUser = async () => {
    // Diğer kullanıcının id'sini bul
    const otherId = chat.participants?.find((p) => p !== currentUserId);
    if (!otherId) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', otherId));
      if (userDoc.exists()) {
        setOtherUser({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (e) {
      console.log('ChatListItem kullanici yuklenemedi:', e.message);
    }
  };

  // Avatar baş harfleri
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  // Son mesajı kısalt
  const truncateMessage = (msg, limit = 40) => {
    if (!msg) return '';
    return msg.length > limit ? msg.substring(0, limit) + '...' : msg;
  };

  // Zaman formatı: bugün ise saat, dün ise "Dün", haftanın günü, tarih
  const getTimeLabel = () => {
    if (!chat.lastMessageTime) return '';
    const ts = chat.lastMessageTime;
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return formatTime(ts);
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) {
      const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      return days[date.getDay()];
    }
    return formatTimeAgo(ts);
  };

  const hasUnread = chat.unreadCount > 0;

  if (!otherUser) {
    // Yükleniyor placeholder
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.avatar, { backgroundColor: '#E5E7EB' }]} />
        <View style={styles.content}>
          <View style={styles.loadingLine} />
          <View style={[styles.loadingLine, { width: '60%', marginTop: 6 }]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(otherUser.displayName)}</Text>
      </View>

      {/* İçerik */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
            {otherUser.displayName || 'Kullanıcı'}
          </Text>
          <Text style={[styles.time, hasUnread && styles.timeUnread]}>
            {getTimeLabel()}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {truncateMessage(chat.lastMessage) || 'Henüz mesaj yok'}
          </Text>

          {/* Okunmamış badge */}
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    fontWeight: '700',
    color: '#111827',
  },
  time: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  timeUnread: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#374151',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingLine: {
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    width: '80%',
  },
});

export default ChatListItem;
