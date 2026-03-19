import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>⇄</Text>
        <Text style={styles.logoText}>Swaply</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Yeteneklerini{'\n'}Paylaş,</Text>
        <Text style={styles.subtitle}>Birlikte Büyü</Text>
        <Text style={styles.description}>
          Kampüsündeki öğrencilerle yeteneklerini takas et, yeni beceriler kazan.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Başla  →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>
            Zaten hesabın var mı? <Text style={styles.loginLinkBold}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginRight: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomSection: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loginLinkBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
