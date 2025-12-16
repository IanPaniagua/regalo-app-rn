import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { useConnections } from '@/src/context/ConnectionsContext';
import { useGroups } from '@/src/context/GroupsContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function CreateGroupScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { user } = useUser();
  const { createGroup, isLoading } = useGroups();
  const { connectedUsers } = useConnections();

  const [giftName, setGiftName] = useState('');
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [memberDeadline, setMemberDeadline] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedRecipientData = connectedUsers.find(u => u.id === selectedRecipient);

  const handleCreate = async () => {
    // Validation
    if (!giftName.trim()) {
      Alert.alert('Error', 'Please enter a gift name');
      return;
    }

    if (giftName.length > 50) {
      Alert.alert('Error', 'Gift name must be 50 characters or less');
      return;
    }

    const price = parseFloat(totalPrice);
    if (!totalPrice || isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price greater than 0');
      return;
    }

    if (!selectedRecipient) {
      Alert.alert('Error', 'Please select who will receive this gift');
      return;
    }

    try {
      const groupId = await createGroup({
        giftName: giftName.trim(),
        description: description.trim() || undefined,
        totalPrice: price,
        recipientUserId: selectedRecipient,
        memberDeadline: memberDeadline,
      });

      // Navigate to invite members screen
      // @ts-ignore - dynamic route
      router.replace(`/group/invite?groupId=${groupId}`);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <AppTitle style={styles.title}>Create Group Gift</AppTitle>
          <AppText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Organize a group gift for someone special
          </AppText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Gift Name */}
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: theme.textSecondary }]}>
              Gift Name *
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              value={giftName}
              onChangeText={setGiftName}
              placeholder="e.g., Birthday Gift for Maria"
              placeholderTextColor={theme.textMuted}
              maxLength={50}
            />
            <AppText style={[styles.helperText, { color: theme.textMuted }]}>
              {giftName.length}/50 characters
            </AppText>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: theme.textSecondary }]}>
              Description (Optional)
            </AppText>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Explain why you're organizing this gift..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <AppText style={[styles.helperText, { color: theme.textMuted }]}>
              {description.length}/200 characters
            </AppText>
          </View>

          {/* Total Price */}
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: theme.textSecondary }]}>
              Total Price (€) *
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              value={totalPrice}
              onChangeText={setTotalPrice}
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
            />
            <AppText style={[styles.helperText, { color: theme.textMuted }]}>
              This will be split among all members
            </AppText>
          </View>

          {/* Member Deadline */}
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: theme.textSecondary }]}>
              Member Acceptance Deadline (Optional)
            </AppText>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  justifyContent: 'center',
                }
              ]}
            >
              <AppText style={{ color: memberDeadline ? theme.text : theme.textMuted }}>
                {memberDeadline ? memberDeadline.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Select deadline date'}
              </AppText>
            </Pressable>
            <AppText style={[styles.helperText, { color: theme.textMuted }]}>
              After this date, no new members can join and payment starts
            </AppText>
            {showDatePicker && (
              <DateTimePicker
                value={memberDeadline || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setMemberDeadline(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Recipient Selector */}
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: theme.textSecondary }]}>
              Who is this gift for? *
            </AppText>
            
            {connectedUsers.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <AppText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  You need to have connections to create a group gift.
                </AppText>
                <AppText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Go to Connect tab to add friends first.
                </AppText>
              </View>
            ) : (
              <View style={styles.recipientList}>
                {connectedUsers.map((connection) => (
                  <View
                    key={connection.id}
                    style={[
                      styles.recipientCard,
                      {
                        backgroundColor: selectedRecipient === connection.id ? theme.primary + '20' : theme.cardBg,
                        borderColor: selectedRecipient === connection.id ? theme.primary : theme.border,
                      }
                    ]}
                    onTouchEnd={() => setSelectedRecipient(connection.id)}
                  >
                    <AppText style={styles.recipientAvatar}>{connection.avatar}</AppText>
                    <AppText style={[styles.recipientName, { color: theme.text }]}>
                      {connection.name}
                    </AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <AppButton
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            style={styles.button}
          />
          <AppButton
            title="Next: Invite Members"
            onPress={handleCreate}
            disabled={isLoading || connectedUsers.length === 0}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.title,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.text,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.text,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    fontFamily: fonts.text,
    marginTop: 4,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  recipientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipientCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  recipientAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 14,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
