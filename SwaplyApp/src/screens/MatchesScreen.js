import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { getMatchesForUser } from '../services/matchService';
import { doc, getDoc } from 'firebase/firestore';

const MatchesScreen = ({ navigation }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        setLoading(true);
        try {
            const currentUid = auth.currentUser?.uid;
            if (!currentUid) return;

            const matchData = await getMatchesForUser(currentUid);

            // her match icin diger kullanicinin bilgilerini getir
            const enriched = await Promise.all(
                matchData.map(async (match) => {
                    const otherId = match.user1 === currentUid ? match.user2 : match.user1;
                    const userDoc = await getDoc(doc(db, 'users', otherId));
                    return {
                        ...match,
                        otherUser: userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null
                    };
                })
            );

            setMatches(enriched.filter(m => m.otherUser));
        } catch (error) {
            console.log('Matchler yuklenemedi:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    const renderMatch = ({ item }) => {
        const { otherUser, skillOverlap } = item;
        return (
            <TouchableOpacity
                style={styles.matchCard}
                onPress={() => navigation.navigate('UserProfile', { userId: otherUser.id })}
                activeOpacity={0.8}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(otherUser.displayName)}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{otherUser.displayName}</Text>
                    <Text style={styles.skills} numberOfLines={1}>
                        Ortak: {skillOverlap?.join(', ')}
                    </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
        );
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Eşleşmelerim</Text>
            </View>

            {matches.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>✨</Text>
                    <Text style={styles.emptyTitle}>Henüz eşleşme yok</Text>
                    <Text style={styles.emptyText}>
                        Yeteneklerini ekle, yakındaki kullanıcılar otomatik eşleşecek!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMatch}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    matchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: '#C4B5FD',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7C3AED',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 3,
    },
    skills: {
        fontSize: 13,
        color: '#6B7280',
    },
    arrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default MatchesScreen;
