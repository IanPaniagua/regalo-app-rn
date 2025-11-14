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
import { authService } from '@/src/services/auth.service';

export default function CreateProfileStep3() {
  const router = useRouter();
  const { tempUser, setUser, clearTempUser } = useUser();
  const { addUser } = useBirthdays();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!tempUser) {
      Alert.alert('Error', 'No se encontraron datos del perfil. Por favor vuelve a empezar.');
      router.replace('/create-profile');
      return;
    }

    try {
      setIsCreating(true);

      // Crear usuario completo: Firebase Auth + Database
      const { authUser, dbUserId } = await authService.createUserProfile({
        email,
        password,
        name: tempUser.name,
        birthdate: tempUser.birthdate,
        hobbies: tempUser.hobbies,
        avatar: '🎉',
      });

      // Guardar en el contexto de usuario autenticado
      const completeUser = {
        id: dbUserId,
        authUid: authUser.uid,
        name: tempUser.name,
        birthdate: tempUser.birthdate,
        hobbies: tempUser.hobbies,
        email,
      };
      setUser(completeUser);

      // Añadir al calendario de cumpleaños
      await addUser({
        id: dbUserId,
        name: completeUser.name,
        avatar: '🎉',
        birthdate: completeUser.birthdate,
        hobbies: completeUser.hobbies,
        email: completeUser.email,
      });

      // Limpiar datos temporales
      clearTempUser();

      console.log('✅ Complete user profile created:', {
        authUid: authUser.uid,
        dbUserId,
      });

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
    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      Alert.alert(
        'Error',
        error.message || 'Hubo un problema al crear tu perfil. Por favor intenta de nuevo.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppContainer>
      <View style={styles.content}>
        <AppTitle style={styles.title}>¿Cuál es tu email?</AppTitle>

        <AppText style={styles.subtitle}>
          Crea tu cuenta para acceder a la app
        </AppText>

        <View style={styles.inputContainer}>
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

        <View style={styles.inputContainer}>
          <AppText style={styles.label}>Contraseña</AppText>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <AppButton
          title={isCreating ? "Creando perfil..." : "Crear cuenta"}
          onPress={handleContinue}
          disabled={!email.trim() || !password.trim() || isCreating}
          style={styles.button}
        />

        {(!email.trim() || !password.trim()) && (
          <AppText style={styles.hint}>
            Debes ingresar email y contraseña para continuar
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
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
