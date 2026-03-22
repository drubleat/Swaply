import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import DiscoverScreen from '../screens/DiscoverScreen';
import MapScreen from '../screens/MapScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

// Tab icon bileşeni — aktifken mor renk uygula
const TabIcon = ({ emoji, focused }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={[styles.iconEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#8B5CF6',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="Discover"
      component={DiscoverScreen}
      options={{
        tabBarLabel: 'Keşfet',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
      }}
    />

    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{
        tabBarLabel: 'Harita',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
      }}
    />

    <Tab.Screen
      name="Matches"
      component={MatchesScreen}
      options={{
        tabBarLabel: 'Eşleşmeler',
        tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
      }}
    />

    <Tab.Screen
      name="Messages"
      component={MessagesScreen}
      options={{
        tabBarLabel: 'Mesajlar',
        tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileStackScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 6,
    paddingTop: 6,
    height: 64,
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrap: {
    width: 36,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconWrapActive: {
    backgroundColor: '#EDE9FE',
  },
  iconEmoji: {
    fontSize: 20,
  },
});

export default MainTabs;
