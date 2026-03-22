import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { getPendingMatchRequests, acceptMatchRequest, rejectMatchRequest } from '../services/matchService';
import { doc, getDoc } from 'firebase/firestore';

const MatchRequestsScreen = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const currentUid = auth.currentUser?.uid;
            const pending = await getPendingMatchRequests(currentUid);

            const enriched = await Promise.all(
                pending.map(async (req) => {
                    const userDoc = await getDoc(doc(db, 'users', req.user1));
                    return {
                        ...req,
                        fromUser: userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null
                    };
                })
            );
            setRequests(enriched.filter(r => r.fromUser));
        } catch (error) {
            console.log('İstekler yuklenemedi:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await acceptMatchRequest(requestId);
            Alert.alert('Başarılı', 'Eşleşme kabul edildi!');
            loadRequests();
        } catch (error) {
            Alert.alert('Hata', error.message);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectMatchRequest(requestId);
            loadRequests();
        } catch (error) {
            Alert.alert('Hata', error.message);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    const renderRequest = ({ item }) => {
        const { fromUser } = item;
        return (
            <View style={styles.requestCard}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('UserProfile', { userId: fromUser.id })}
                    activeOpacity={0.8}
                    style={styles.cardLeft}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(fromUser.displayName)}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{fromUser.displayName}</Text>
                        <Text style={styles.message}>Seninle eşleşmek istiyor</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAccept(item.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.acceptText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(item.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.rejectText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Eşleşme İstekleri</Text>
                <View style={{ width: 40 }} />
            </View>

            {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>✨</Text>
                    <Text style={styles.emptyTitle}>Yeni istek yok</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRequest}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
    listContent: {
        padding: 16,
    },
    requestCard: {
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
    cardLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 3,
    },
    message: {
        fontSize: 13,
        color: '#6B7280',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    rejectBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
});

export default MatchRequestsScreen;
