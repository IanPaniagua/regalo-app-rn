import { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { useUser } from '@/src/context/UserContext';

const AVATARS = [
  '👨', '👩', '🧑', '👴', '👵', '🧓',
  '👨‍🦱', '👩‍🦱', '🧑‍🦱', '👨‍🦰', '👩‍🦰', '🧑‍🦰',
  '👨‍🦳', '👩‍🦳', '🧑‍🦳', '👨‍🦲', '👩‍🦲', '🧑‍🦲',
  '👱‍♂️', '👱‍♀️', '👱', '🧔', '🧔‍♂️', '🧔‍♀️',
  '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🎓', '👩‍🎓', '🧑‍🎓',
  '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️',
  '👨‍🌾', '👩‍🌾', '🧑‍🌾', '👨‍🍳', '👩‍🍳', '🧑‍🍳',
  '👨‍🔧', '👩‍🔧', '🧑‍🔧', '👨‍🏭', '👩‍🏭', '🧑‍🏭',
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧑‍🔬',
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎤', '👩‍🎤', '🧑‍🎤',
  '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍✈️', '👩‍✈️', '🧑‍✈️',
  '👨‍🚀', '👩‍🚀', '🧑‍🚀', '👨‍🚒', '👩‍🚒', '🧑‍🚒',
  '👮‍♂️', '👮‍♀️', '👮', '🕵️‍♂️', '🕵️‍♀️', '🕵️',
  '💂‍♂️', '💂‍♀️', '💂', '👷‍♂️', '👷‍♀️', '👷',
  '🤴', '👸', '👳‍♂️', '👳‍♀️', '👳', '👲',
  '🧕', '🤵‍♂️', '🤵‍♀️', '🤵', '👰‍♂️', '👰‍♀️',
  '🤰', '🤱', '👼', '🎅', '🤶', '🧑‍🎄',
];

export default function CreateProfileAvatar() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { tempUser, setTempUser } = useUser();
  const [selectedAvatar, setSelectedAvatar] = useState(tempUser?.avatar || '');

  const handleContinue = () => {
    if (tempUser) {
      setTempUser({
        ...tempUser,
        avatar: selectedAvatar,
      });
    }

    router.push('/create-profile/email');
  };

  return (
    <AppContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <AppTitle style={styles.title}>Elige tu avatar</AppTitle>

            <AppText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Selecciona un icono que te represente
            </AppText>

            <View style={styles.avatarsGrid}>
              {AVATARS.map((avatar, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.avatarButton,
                    { backgroundColor: theme.inputBg, borderColor: theme.border },
                    selectedAvatar === avatar && styles.avatarButtonSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <AppText style={styles.avatarEmoji}>{avatar}</AppText>
                </Pressable>
              ))}
            </View>

            <AppButton
              title="Save and Continue"
              onPress={handleContinue}
              disabled={!selectedAvatar}
              style={styles.button}
            />

            {!selectedAvatar && (
              <AppText style={[styles.hint, { color: theme.textMuted }]}>
                Selecciona un avatar para continuar
              </AppText>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'center',
  },
  avatarButton: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtonSelected: {
    borderColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
