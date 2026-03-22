import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { calculateDistance } from '../utils/locationUtils';
import Avatar from './Avatar';

const UserCard = ({ user, currentUserLocation, onPress, isMatched = false }) => {
  // Mesafeyi hesapla
  const getDistance = () => {
    if (!currentUserLocation || !user.location) return null;

    const dist = calculateDistance(
      currentUserLocation.latitude,
      currentUserLocation.longitude,
      user.location.latitude ?? user.location.lat,
      user.location.longitude ?? user.location.lng
    );

    if (dist < 1) return `${Math.round(dist * 1000)} m`;
    return `${dist.toFixed(1)} km`;
  };

  // Rating yıldızlarını oluştur
  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rounded ? '★' : '☆';
    }
    return stars;
  };

  const distance = getDistance();
  const teachSkills = user.skillsToTeach || [];
  const learnSkills = user.skillsToLearn || [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* eslesme rozeti */}
      {isMatched && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>✨ Eşleşme</Text>
        </View>
      )}
      {/* Sol: Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar photoURL={user.photoURL} displayName={user.displayName} size={56} />
        {/* Online göstergesi (opsiyonel) */}
        <View style={styles.onlineIndicator} />
      </View>

      {/* Sağ: Bilgiler */}
      <View style={styles.info}>
        {/* İsim + Rating */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{user.displayName || 'İsimsiz'}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {(user.rating || 0).toFixed(1)} ★
            </Text>
          </View>
        </View>

        {/* Konum + Mesafe */}
        {distance && (
          <Text style={styles.distance}>📍 {distance} uzakta</Text>
        )}

        {/* Öğretiyor */}
        {teachSkills.length > 0 && (
          <View style={styles.skillRow}>
            <View style={styles.teachBadge}>
              <Text style={styles.teachBadgeText}>ÖĞRETİYOR</Text>
            </View>
            <Text style={styles.skillText} numberOfLines={1}>
              {teachSkills.join(', ')}
            </Text>
          </View>
        )}

        {/* İstiyor */}
        {learnSkills.length > 0 && (
          <View style={styles.skillRow}>
            <View style={styles.learnBadge}>
              <Text style={styles.learnBadgeText}>İSTİYOR</Text>
            </View>
            <Text style={styles.skillText} numberOfLines={1}>
              {learnSkills.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 7,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  distance: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  teachBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  teachBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.3,
  },
  learnBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  learnBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.3,
  },
  skillText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  matchBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default UserCard;
