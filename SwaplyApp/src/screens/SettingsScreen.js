import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { deleteAccount, logoutUser } from '../services/authService';
import { doc, deleteDoc } from 'firebase/firestore';

const SettingsScreen = ({ navigation }) => {
  const currentUser = auth.currentUser;

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabını silmek istediğinden emin misin? Bu işlem geri alınamaz ve tüm veriler kalıcı olarak silinecek.',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete user document from Firestore (also handled in authService but keeping here just in case, wait, I will just call deleteAccount from authService)
              // Actually, the user prompt provided the implementation. Let's use it exactly.
              await deleteDoc(doc(db, 'users', currentUser.uid));
              
              // Delete Firebase Auth user
              await currentUser.delete();
              
              // User will be automatically logged out by auth state listener
              Alert.alert('Başarılı', 'Hesabın silindi');
              
            } catch (error) {
              console.error('Delete account error:', error);
              
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Yeniden Giriş Gerekli',
                  'Güvenlik nedeniyle lütfen çıkış yap ve tekrar giriş yaparak hesabını sil.'
                );
              } else {
                Alert.alert('Hata', 'Hesap silinirken hata oluştu: ' + error.message);
              }
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinden emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          onPress: async () => {
            await logoutUser();
            // Auth state listener will navigate to AuthStack
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          
          <TouchableOpacity 
            style={styles.item}
            onPress={() => Alert.alert("Yakında", "Profil düzenleme 22 Mart'ta eklenecek (Furkan)")}
          >
            <Text style={styles.itemText}>Profili Düzenle</Text>
            <Text style={styles.itemArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.item}>
            <Text style={styles.itemText}>E-posta</Text>
            <Text style={styles.itemValue}>{currentUser?.email}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          
          <TouchableOpacity 
            style={styles.item}
            onPress={() => Alert.alert('Yakında', 'Şifre değiştirme özelliği eklenecek')}
          >
            <Text style={styles.itemText}>Şifremi Değiştir</Text>
            <Text style={styles.itemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.item}
            onPress={() => Alert.alert('Yakında', 'Gizlilik politikası eklenecek')}
          >
            <Text style={styles.itemText}>Gizlilik Politikası</Text>
            <Text style={styles.itemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.item}
            onPress={handleLogout}
          >
            <Text style={styles.itemText}>Çıkış Yap</Text>
            <Text style={styles.itemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Tehlikeli Alan</Text>
          
          <TouchableOpacity 
            style={[styles.item, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.dangerText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Swaply v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  scrollView: {
    flex: 1
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937'
  },
  itemValue: {
    fontSize: 14,
    color: '#6B7280'
  },
  itemArrow: {
    fontSize: 18,
    color: '#9CA3AF'
  },
  dangerTitle: {
    color: '#EF4444'
  },
  dangerItem: {
    borderBottomColor: '#FEE2E2'
  },
  dangerText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600'
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginVertical: 30
  }
});

export default SettingsScreen;
