import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors, fonts } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';

const HOBBIES = [
  'Deportes',
  'Lectura',
  'Música',
  'Cine',
  'Cocina',
  'Viajes',
  'Fotografía',
  'Gaming',
  'Arte',
  'Tecnología',
];

export default function CreateProfileStep2() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  const addCustomHobby = () => {
    if (customHobby.trim()) {
      setSelectedHobbies([...selectedHobbies, customHobby.trim()]);
      setCustomHobby('');
      setShowCustomInput(false);
    }
  };

  const handleContinue = () => {
    // Guardar hobbies en el contexto
    if (user) {
      setUser({
        ...user,
        hobbies: selectedHobbies,
      });
    }
    // @ts-ignore
    router.push('/create-profile/email');
  };

  return (
    <AppContainer>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AppTitle style={styles.title}>¿Cuáles son tus hobbies?</AppTitle>

        <View style={styles.hobbiesGrid}>
          {HOBBIES.map((hobby) => (
            <Pressable
              key={hobby}
              style={[
                styles.hobbyChip,
                selectedHobbies.includes(hobby) && styles.hobbyChipSelected,
              ]}
              onPress={() => toggleHobby(hobby)}
            >
              <AppText
                style={[
                  styles.hobbyText,
                  selectedHobbies.includes(hobby) && styles.hobbyTextSelected,
                ]}
              >
                {hobby}
              </AppText>
            </Pressable>
          ))}

          <Pressable
            style={[styles.hobbyChip, styles.hobbyChipOther]}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <AppText style={styles.hobbyText}>Otro</AppText>
          </Pressable>
        </View>

        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.input}
              value={customHobby}
              onChangeText={setCustomHobby}
              placeholder="Escribe tu hobby"
              placeholderTextColor="#666"
              onSubmitEditing={addCustomHobby}
            />
            <Pressable style={styles.addButton} onPress={addCustomHobby}>
              <AppText style={styles.addButtonText}>Añadir</AppText>
            </Pressable>
          </View>
        )}

        {selectedHobbies.length > 0 && (
          <View style={styles.selectedContainer}>
            <AppText style={styles.selectedLabel}>Seleccionados:</AppText>
            <View style={styles.selectedList}>
              {selectedHobbies.map((hobby, index) => (
                <View key={index} style={styles.selectedChip}>
                  <AppText style={styles.selectedText}>{hobby}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        <AppButton
          title="Save and Continue"
          onPress={handleContinue}
          style={styles.button}
        />
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  title: {
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  hobbyChip: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  hobbyChipSelected: {
    backgroundColor: colors.primary,
  },
  hobbyChipOther: {
    borderStyle: 'dashed',
  },
  hobbyText: {
    fontSize: 14,
    color: colors.white,
  },
  hobbyTextSelected: {
    color: colors.secondary,
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.secondary,
    fontWeight: '600',
  },
  selectedContainer: {
    marginBottom: 24,
  },
  selectedLabel: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectedText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    marginBottom: 40,
  },
});
