import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

// Import screens (we'll create placeholders)
import DiscoverScreen from '../screens/DiscoverScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        }
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          )
        }}
      />
      
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Mesajlar',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>💬</Text>
          )
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
