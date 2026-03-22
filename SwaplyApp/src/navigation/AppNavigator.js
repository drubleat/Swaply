import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

// Import navigators
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Import modal/stack screens (pushed above tab bar)
import EditProfileScreen from '../screens/EditProfileScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import RatingScreen from '../screens/RatingScreen';
import MatchRequestsScreen from '../screens/MatchRequestsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // onceki firestore dinleyiciyi temizle
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (currentUser) {
        setUser(currentUser);
        // profil belgesi degisince otomatik guncelle
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeDoc = onSnapshot(userRef, (snap) => {
          setHasProfile(snap.exists());
          setLoading(false);
        });
      } else {
        setUser(null);
        setHasProfile(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  if (loading) {
    // Show loading screen while checking auth
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Giriş yapılmamış → Auth ekranları
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : !hasProfile ? (
          // Profil tamamlanmamış → Profil kurulumu
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          // Giriş yapılmış ve profil var → Ana uygulama
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Rating" component={RatingScreen} />
            <Stack.Screen name="MatchRequests" component={MatchRequestsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
