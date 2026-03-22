import React from 'react';
import { View, StyleSheet } from 'react-native';

const UserCardSkeleton = () => (
    <View style={styles.card}>
        <View style={styles.avatarSkeleton} />
        <View style={styles.info}>
            <View style={styles.nameSkeleton} />
            <View style={styles.distanceSkeleton} />
            <View style={styles.skillSkeleton} />
            <View style={styles.skillSkeleton} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 7,
    },
    avatarSkeleton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E5E7EB',
        marginRight: 14,
    },
    info: {
        flex: 1,
        gap: 8,
    },
    nameSkeleton: {
        height: 16,
        width: '60%',
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
    },
    distanceSkeleton: {
        height: 14,
        width: '40%',
        backgroundColor: '#F3F4F6',
        borderRadius: 7,
    },
    skillSkeleton: {
        height: 12,
        width: '80%',
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
    },
});

export default UserCardSkeleton;
