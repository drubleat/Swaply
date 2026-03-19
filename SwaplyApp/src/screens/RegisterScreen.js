import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // validasyonlar
    if (!name.trim()) {
      Alert.alert('Hata', 'Ad Soyad boş bırakılamaz.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresi boş bırakılamaz.');
      return;
    }
    if (!email.trim().endsWith('.edu.tr')) {
      Alert.alert('Hata', 'Sadece @edu.tr uzantılı e-postalar kabul edilir.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email.trim(), password, name.trim());
      console.log('Kayit basarili:', user.uid);
      Alert.alert('Başarılı', 'Hesabın oluşturuldu! E-posta doğrulama linki gönderildi.');
      // TODO: Navigate to ProfileSetupScreen
    } catch (error) {
      console.log('Kayit hatasi:', error.message);
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>Swaply</Text>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>✏️</Text>
            </View>

            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              Kampüsündeki öğrencilerle yeteneklerini takas etmeye başla!
            </Text>

            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="Üniversite e-postan (@edu.tr)"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifre (en az 6 karakter)"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifre Tekrar"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.registerButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLink}>
              Zaten hesabın var mı? <Text style={styles.bottomLinkBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  registerButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 13,
  },
  loginButton: {
    borderWidth: 1.5,
    borderColor: '#EC4899',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#EC4899',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLink: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  bottomLinkBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
