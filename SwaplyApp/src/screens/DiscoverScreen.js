import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logoutUser } from '../services/authService';

const DiscoverScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await logoutUser();
    // Auth state listener will automatically navigate to AuthStack
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Keşfet</Text>
      <Text style={styles.subtitle}>Yetenek sahiplerini keşfet</Text>
      
      <Text style={styles.note}>
        📝 Bu ekran henüz geliştirilmedi.{'\n'}
        Yusuf Çakır 21 Mart'ta tamamlayacak.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış Yap (Test)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 30
  },
  note: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default DiscoverScreen;
