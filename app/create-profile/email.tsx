import { useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors, fonts } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';

export default function CreateProfileStep3() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { addUser } = useBirthdays();
  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Guardar email y completar perfil en el contexto
    if (user) {
      const completeUser = {
        ...user,
        email,
      };
      setUser(completeUser);

      // Añadir usuario al calendario de cumpleaños
      addUser({
        id: `user-${Date.now()}`, // ID único basado en timestamp
        name: completeUser.name,
        avatar: '🎉', // Avatar por defecto para usuarios creados
        birthdate: completeUser.birthdate,
        hobbies: completeUser.hobbies,
        email: completeUser.email,
      });
    }

    Alert.alert(
      'Perfil creado',
      '¡Tu perfil ha sido creado exitosamente!',
      [
        {
          text: 'OK',
          onPress: () => {
            // @ts-ignore
            router.replace('/(drawer)/(tabs)/calendar');
          },
        },
      ]
    );
  };

  return (
    <AppContainer>
      <View style={styles.content}>
        <AppTitle style={styles.title}>¿Cuál es tu email?</AppTitle>

        <AppText style={styles.subtitle}>
          Lo usaremos para identificarte en la app
        </AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Email</AppText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <AppButton
          title="Ir a la app"
          onPress={handleContinue}
          style={styles.button}
          disabled={!email.trim()}
        />

        {!email.trim() && (
          <AppText style={styles.hint}>
            Debes ingresar un email para continuar
          </AppText>
        )}
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 40,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  button: {
    marginTop: 16,
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
