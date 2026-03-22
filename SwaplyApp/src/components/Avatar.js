import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const Avatar = ({ photoURL, displayName, size = 56, fontSize = 20 }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    if (photoURL) {
        return (
            <Image
                source={{ uri: photoURL }}
                style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            />
        );
    }

    return (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.initials, { fontSize }]}>
                {getInitials(displayName)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        backgroundColor: '#EDE9FE',
    },
    placeholder: {
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontWeight: 'bold',
        color: '#7C3AED',
    },
});

export default Avatar;
