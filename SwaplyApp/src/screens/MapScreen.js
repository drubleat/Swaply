import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, SafeAreaView, Alert, StatusBar
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { calculateDistance } from '../utils/locationUtils';

const MapScreen = ({ navigation }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radius, setRadius] = useState(5);

    const currentUser = auth.currentUser;

    useEffect(() => {
        loadUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadNearbyUsers();
        }
    }, [userLocation, radius]);

    const loadUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Konum izni gerekli', 'Haritayı kullanmak için konum izni verin');
                setLoading(false);
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        } catch (error) {
            console.log('Konum hatasi:', error.message);
            Alert.alert('Hata', 'Konum alınamadı');
            setLoading(false);
        }
    };

    const loadNearbyUsers = async () => {
        setLoading(true);
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            const users = [];

            snapshot.forEach((doc) => {
                if (doc.id === currentUser.uid) return;
                const data = doc.data();
                const userLoc = data.location;
                if (!userLoc) return;

                const lat = userLoc.latitude ?? userLoc.lat;
                const lng = userLoc.longitude ?? userLoc.lng;
                if (!lat || !lng) return;

                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    lat,
                    lng
                );

                if (distance <= radius) {
                    users.push({ id: doc.id, ...data, distance });
                }
            });

            setNearbyUsers(users);
        } catch (error) {
            console.log('Yakin kullaniciler yuklenemedi:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (user) => {
        navigation.navigate('UserProfile', { userId: user.id });
    };

    if (loading || !userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Harita yükleniyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Yetenek Haritası</Text>
                <Text style={styles.subtitle}>{nearbyUsers.length} kişi yakınında</Text>
            </View>

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {/* yaricap cemberi */}
                <Circle
                    center={userLocation}
                    radius={radius * 1000}
                    fillColor="rgba(139, 92, 246, 0.1)"
                    strokeColor="rgba(139, 92, 246, 0.5)"
                    strokeWidth={2}
                />

                {nearbyUsers.map((user) => {
                    const loc = user.location;
                    return (
                        <Marker
                            key={user.id}
                            coordinate={{
                                latitude: loc.latitude ?? loc.lat,
                                longitude: loc.longitude ?? loc.lng
                            }}
                            title={user.displayName}
                            description={`${user.distance.toFixed(1)} km · ${user.skillsToTeach?.slice(0, 2).join(', ') || ''}`}
                            onCalloutPress={() => handleMarkerPress(user)}
                            pinColor="#8B5CF6"
                        />
                    );
                })}
            </MapView>

            {/* yaricap kontrol */}
            <View style={styles.radiusControl}>
                <Text style={styles.radiusLabel}>Yarıçap: {radius} km</Text>
                <View style={styles.radiusButtons}>
                    {[3, 5, 10].map((r) => (
                        <TouchableOpacity
                            key={r}
                            style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
                            onPress={() => setRadius(r)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.radiusBtnText, radius === r && styles.radiusBtnTextActive]}>
                                {r} km
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#6B7280',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 2,
    },
    map: {
        flex: 1,
    },
    radiusControl: {
        position: 'absolute',
        bottom: 30,
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    radiusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
        textAlign: 'center',
    },
    radiusButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    radiusBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    radiusBtnActive: {
        backgroundColor: '#8B5CF6',
    },
    radiusBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    radiusBtnTextActive: {
        color: '#FFFFFF',
    },
});

export default MapScreen;
