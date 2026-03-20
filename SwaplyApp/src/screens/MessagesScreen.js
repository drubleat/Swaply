import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessagesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Mesajlar</Text>
      <Text style={styles.subtitle}>Eşleşmelerinle sohbet et</Text>
      
      <Text style={styles.note}>
        📝 Bu ekran henüz geliştirilmedi.{'\n'}
        Yusuf Çakır 21 Mart'ta tamamlayacak.
      </Text>
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
    lineHeight: 20
  }
});

export default MessagesScreen;
