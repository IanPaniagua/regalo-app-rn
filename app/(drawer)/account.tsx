import { useState } from 'react';
import { View, StyleSheet, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContainer, AppText, AppCard } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { colors } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { authService } from '@/src/services/auth.service';
import { db } from '@/src/database';
import { deleteUser } from 'firebase/auth';

export default function AccountScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { user, clearUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('account_logout_confirm_title'),
      t('account_logout_confirm_message'),
      [
        {
          text: t('account_logout_confirm_cancel'),
          style: 'cancel',
        },
        {
          text: t('account_logout_confirm_button'),
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      setIsLoading(true);
      
      // Cerrar sesión en Firebase Auth
      await authService.signOut();
      
      // Limpiar datos del usuario en contexto
      clearUser();
      
      console.log('✅ User logged out successfully');
      
      // Redirigir a welcome
      router.replace('/welcome' as any);
    } catch (error: any) {
      console.error('❌ Error logging out:', error);
      Alert.alert(t('account_delete_error_title'), t('account_logout_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('account_delete_confirm_title'),
      t('account_delete_confirm_message'),
      [
        {
          text: t('account_delete_confirm_cancel'),
          style: 'cancel',
        },
        {
          text: t('account_delete_confirm_button'),
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      t('account_delete_final_title'),
      t('account_delete_final_message'),
      [
        {
          text: t('account_delete_final_cancel'),
          style: 'cancel',
        },
        {
          text: t('account_delete_final_button'),
          style: 'destructive',
          onPress: performDeleteAccount,
        },
      ]
    );
  };

  const performDeleteAccount = async () => {
    if (!user) {
      Alert.alert(t('account_delete_error_title'), t('account_delete_error_no_user'));
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Starting account deletion process...');

      // 1. Eliminar todas las conexiones donde el usuario participa
      console.log('🔗 Deleting connections...');
      const adapter = db.getAdapter();
      
      if (!user.id) {
        throw new Error('User ID is missing');
      }
      
      // Obtener todas las conexiones del usuario
      const userConnections = await adapter.getConnectionsByUser(user.id);

      // Eliminar cada conexión
      for (const connection of userConnections) {
        await adapter.deleteConnection(connection.id);
        console.log(`✅ Deleted connection: ${connection.id}`);
      }

      // 2. Eliminar el perfil del usuario de Firestore
      console.log('👤 Deleting user profile from Firestore...');
      if (user.id) {
        await adapter.deleteUser(user.id);
      }
      console.log('✅ User profile deleted from Firestore');

      // 3. Eliminar la cuenta de Firebase Auth
      console.log('🔐 Deleting Firebase Auth account...');
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await deleteUser(currentUser);
        console.log('✅ Firebase Auth account deleted');
      }

      // 4. Limpiar datos locales
      clearUser();

      console.log('✅ Account deletion completed successfully');

      // Mostrar mensaje de éxito y redirigir
      Alert.alert(
        t('account_delete_success_title'),
        t('account_delete_success_message'),
        [
          {
            text: 'OK',
            onPress: () => router.replace('/welcome' as any),
          },
        ]
      );

    } catch (error: any) {
      console.error('❌ Error deleting account:', error);
      
      let errorMessage = t('account_delete_error_message');
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage += t('account_delete_error_reauth');
      } else {
        errorMessage += error.message || 'Error desconocido';
      }
      
      Alert.alert(t('account_delete_error_title'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={[styles.loadingText, { color: theme.textMuted }]}>
            {t('account_processing')}
          </AppText>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={64} color={colors.primary} />
          <AppText style={[styles.email, { color: theme.text }]}>{user?.email}</AppText>
          <AppText style={[styles.name, { color: theme.textSecondary }]}>{user?.name}</AppText>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.text }]}>
            {t('account_section_title')}
          </AppText>

          {/* Logout */}
          <Pressable onPress={handleLogout}>
            <AppCard style={styles.actionCard}>
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <Ionicons name="log-out-outline" size={24} color={colors.primary} />
                  <View style={styles.actionText}>
                    <AppText style={[styles.actionTitle, { color: theme.text }]}>
                      {t('account_logout_title')}
                    </AppText>
                    <AppText style={[styles.actionDescription, { color: theme.textMuted }]}>
                      {t('account_logout_description')}
                    </AppText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
              </View>
            </AppCard>
          </Pressable>

          {/* Delete Account */}
          <Pressable onPress={handleDeleteAccount}>
            <AppCard style={[styles.actionCard, styles.dangerCard]}>
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <Ionicons name="trash-outline" size={24} color={colors.tertiary} />
                  <View style={styles.actionText}>
                    <AppText style={[styles.actionTitle, { color: colors.tertiary }]}>
                      {t('account_delete_title')}
                    </AppText>
                    <AppText style={[styles.actionDescription, { color: theme.textMuted }]}>
                      {t('account_delete_description')}
                    </AppText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
              </View>
            </AppCard>
          </Pressable>
        </View>

        <View style={styles.warning}>
          <Ionicons name="information-circle-outline" size={20} color={theme.textMuted} />
          <AppText style={[styles.warningText, { color: theme.textMuted }]}>
            {t('account_warning')}
          </AppText>
        </View>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  name: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    padding: 16,
  },
  dangerCard: {
    borderColor: colors.tertiary,
    borderWidth: 1,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
  },
  warningText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
