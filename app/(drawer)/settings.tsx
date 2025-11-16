import { View, StyleSheet, Alert, Switch, Linking } from 'react-native';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { useNotifications } from '@/src/context/NotificationsContext';
import { colors } from '@/src/theme';

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    isPermissionGranted,
    requestPermissions,
  } = useNotifications();

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // Activar notificaciones: si no hay permiso del SO, pedirlo
      if (!isPermissionGranted) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Notifications disabled',
            'You have denied notification permissions. To enable push notifications, please allow them in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open settings',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return;
        }
      }
      await setNotificationsEnabled(true);
    } else {
      // Desactivar notificaciones solo a nivel de app (no cambia ajustes del sistema)
      await setNotificationsEnabled(false);
    }
  };

  return (
    <AppContainer>
      <View style={styles.content}>
        <AppTitle>Settings</AppTitle>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Notifications</AppText>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.label}>Enable push notifications</AppText>
              <AppText style={styles.helper}>
                Birthday reminders and invitations.
              </AppText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#777', true: colors.primary }}
              thumbColor={'#ffffff'}
            />
          </View>

          {!isPermissionGranted && (
            <AppText style={styles.warning}>
              Notifications are disabled at system level. To receive birthday reminders,
              please enable notifications for RegaloApp in your device settings.
            </AppText>
          )}
        </View>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '500',
  },
  helper: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.8,
  },
  warning: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF3B30',
  },
});
