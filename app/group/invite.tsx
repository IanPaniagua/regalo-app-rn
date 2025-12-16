import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { useConnections } from '@/src/context/ConnectionsContext';
import { useGroups } from '@/src/context/GroupsContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function InviteMembersScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { inviteMembers, isLoading } = useGroups();
  const { connectedUsers } = useConnections();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = connectedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No members selected', 'Please select at least one person to invite');
      return;
    }

    try {
      await inviteMembers(groupId, selectedUsers);
      
      Alert.alert(
        'Invitations Sent',
        `${selectedUsers.length} ${selectedUsers.length === 1 ? 'person has' : 'people have'} been invited to the group`,
        [
          {
            text: 'OK',
            onPress: () => {
              // @ts-ignore - dynamic route
              router.replace(`/group/${groupId}`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error inviting members:', error);
      Alert.alert('Error', 'Failed to send invitations. Please try again.');
    }
  };

  const handleSkip = () => {
    // @ts-ignore - dynamic route
    router.replace(`/group/${groupId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppTitle style={styles.title}>Invite Members</AppTitle>
        <AppText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Select people to join this group gift
        </AppText>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.inputBg,
              color: theme.text,
              borderColor: theme.border,
            }
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or username..."
          placeholderTextColor={theme.textMuted}
        />
      </View>

      {/* Selected Count */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <AppText style={[styles.selectedText, { color: theme.primary }]}>
            {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'} selected
          </AppText>
        </View>
      )}

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchQuery ? 'No users found' : 'No connections available'}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleUser(item.id)}
              style={[
                styles.userCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: selectedUsers.includes(item.id) ? theme.primary : theme.border,
                  borderWidth: selectedUsers.includes(item.id) ? 2 : 1,
                }
              ]}
            >
              <View style={styles.userInfo}>
                <AppText style={styles.userAvatar}>{item.avatar}</AppText>
                <View style={styles.userDetails}>
                  <AppText style={[styles.userName, { color: theme.text }]}>
                    {item.name}
                  </AppText>
                  {item.username && (
                    <AppText style={[styles.userUsername, { color: theme.textSecondary }]}>
                      @{item.username}
                    </AppText>
                  )}
                </View>
              </View>
              
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: selectedUsers.includes(item.id) ? theme.primary : 'transparent',
                  borderColor: selectedUsers.includes(item.id) ? theme.primary : theme.border,
                }
              ]}>
                {selectedUsers.includes(item.id) && (
                  <AppText style={styles.checkmark}>✓</AppText>
                )}
              </View>
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Buttons */}
      <View style={styles.buttons}>
        <AppButton
          title="Skip for Now"
          onPress={handleSkip}
          variant="secondary"
          style={styles.button}
        />
        <AppButton
          title={`Invite ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
          onPress={handleInvite}
          disabled={isLoading || selectedUsers.length === 0}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.text,
  },
  selectedContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  selectedText: {
    fontSize: 14,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.text,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    fontFamily: fonts.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
  },
});
