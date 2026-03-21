import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Import navigators
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Import modal/stack screens (pushed above tab bar)
import ChatDetailScreen from '../screens/ChatDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is logged in, check if profile exists
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          // Profile exists, user can access main app
          setUser(currentUser);
          setHasProfile(true);
        } else {
          // No profile yet, need to complete ProfileSetup
          setUser(currentUser);
          setHasProfile(false);
        }
      } else {
        // User not logged in
        setUser(null);
        setHasProfile(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
