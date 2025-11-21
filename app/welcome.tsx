import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { useLanguage } from '@/src/context/LanguageContext';
import { colors } from '@/src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <AppContainer style={styles.container}>
      <AppTitle style={styles.title}>{t('welcome_title')}</AppTitle>
      
      <Image
        source={require('@/assets/images/logo.svg')}
        style={styles.logo}
        contentFit="contain"
        tintColor={colors.primary}
      />

      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.button}
          onPress={() => {
            // @ts-ignore - Expo Router typed routes
            router.push('/create-profile');
          }}
        >
          <AppText style={styles.buttonText}>{t('welcome_create_profile')}</AppText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            // @ts-ignore - Expo Router typed routes
            router.push('/login');
          }}
        >
          <AppText style={styles.buttonText}>{t('welcome_login')}</AppText>
        </Pressable>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 60,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
