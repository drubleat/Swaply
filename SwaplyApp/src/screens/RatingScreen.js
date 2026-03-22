import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StatusBar
} from 'react-native';
import { submitRating } from '../services/ratingService';
import { auth } from '../services/firebaseConfig';

const RatingScreen = ({ route, navigation }) => {
    const { userId, userName } = route.params;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const currentUser = auth.currentUser;

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Hata', 'Lütfen yıldız seçin');
            return;
        }

        setLoading(true);
        try {
            await submitRating(currentUser.uid, userId, rating, comment);
            Alert.alert('Başarılı', 'Değerlendirme kaydedildi!', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => (
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.star, star <= rating ? styles.starFull : styles.starEmpty]}>
                        {star <= rating ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Değerlendir</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.userSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userName?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.subtitle}>Takas deneyimini değerlendir</Text>
                </View>

                {renderStars()}

                <View style={styles.commentSection}>
                    <Text style={styles.label}>Yorum (Opsiyonel)</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Takas deneyimin nasıldı?"
                        placeholderTextColor="#9CA3AF"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        maxLength={200}
                    />
                    <Text style={styles.charCount}>{comment.length}/200</Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, (rating === 0 || loading) && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={rating === 0 || loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitBtnText}>Gönder</Text>
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
    content: {
        flex: 1,
        padding: 24,
    },
    userSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#C4B5FD',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#7C3AED',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    star: {
        fontSize: 48,
    },
    starFull: {
        color: '#F59E0B',
    },
    starEmpty: {
        color: '#D1D5DB',
    },
    commentSection: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#1F2937',
        minHeight: 100,
        textAlignVertical: 'top',
        backgroundColor: '#FAFAFA',
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 6,
    },
    submitBtn: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitBtnDisabled: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default RatingScreen;
