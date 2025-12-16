import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { GiftGroup, useGroups } from '@/src/context/GroupsContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useNotifications } from '@/src/context/NotificationsContext';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

export default function GroupsScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { activeGroups, closedGroups, pendingInvitations, isLoading, myGroups, acceptInvite, rejectInvite } = useGroups();
  const { clearGroupNotifications } = useNotifications();
  const [showClosed, setShowClosed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayedGroups = showClosed ? closedGroups : activeGroups;
  
  // Debug: log all groups to see what we have
  useEffect(() => {
    console.log('📊 Groups screen - Total groups:', myGroups.length);
    console.log('📊 Pending invitations:', pendingInvitations.length);
    console.log('📊 Active groups:', activeGroups.length);
    console.log('📊 Closed groups:', closedGroups.length);
  }, [myGroups, pendingInvitations, activeGroups, closedGroups]);

  // Clear group notifications when entering this screen
  useEffect(() => {
    clearGroupNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Groups auto-refresh via context
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateGroup = () => {
    // @ts-ignore - dynamic route
    router.push('/group/create');
  };

  const handleGroupPress = (groupId: string) => {
    // @ts-ignore - dynamic route
    router.push(`/group/${groupId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppTitle style={styles.title}>Groups</AppTitle>
        <AppButton
          title="+ New Group"
          onPress={handleCreateGroup}
          style={styles.createButton}
        />
      </View>

      {/* Toggle Active/Closed */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setShowClosed(false)}
          style={[
            styles.toggleButton,
            { borderBottomColor: !showClosed ? theme.primary : 'transparent' }
          ]}
        >
          <AppText style={[
            styles.toggleText,
            { color: !showClosed ? theme.primary : theme.textSecondary }
          ]}>
            Active ({activeGroups.length})
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setShowClosed(true)}
          style={[
            styles.toggleButton,
            { borderBottomColor: showClosed ? theme.primary : 'transparent' }
          ]}
        >
          <AppText style={[
            styles.toggleText,
            { color: showClosed ? theme.primary : theme.textSecondary }
          ]}>
            History ({closedGroups.length})
          </AppText>
        </Pressable>
      </View>

      {/* Pending Invitations Section */}
      {!showClosed && pendingInvitations.length > 0 && (
        <View style={styles.invitationsSection}>
          <AppText style={[styles.sectionTitle, { color: theme.text }]}>
            Pending Invitations ({pendingInvitations.length})
          </AppText>
          {pendingInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={async () => {
                await acceptInvite(invitation.id);
              }}
              onReject={async () => {
                await rejectInvite(invitation.id);
              }}
            />
          ))}
        </View>
      )}

      {/* Groups List */}
      {displayedGroups.length === 0 && pendingInvitations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={[styles.emptyText, { color: theme.textSecondary }]}>
            {showClosed 
              ? 'No closed groups yet'
              : 'No active groups. Create one to get started!'}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={displayedGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GroupCard group={item} onPress={handleGroupPress} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </View>
  );
}

// ==================== Invitation Card Component ====================

interface InvitationCardProps {
  invitation: GiftGroup;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

function InvitationCard({ invitation, onAccept, onReject }: InvitationCardProps) {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.invitationCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={styles.invitationHeader}>
        <AppText style={[styles.invitationTitle, { color: theme.text }]}>
          🎁 {invitation.giftName}
        </AppText>
        <AppText style={[styles.invitationRecipient, { color: theme.textSecondary }]}>
          For: {invitation.recipientName} {invitation.recipientAvatar}
        </AppText>
        <AppText style={[styles.invitationPrice, { color: theme.primary }]}>
          {invitation.totalPrice}€
        </AppText>
      </View>
      
      <View style={styles.invitationActions}>
        <Pressable
          onPress={handleReject}
          disabled={loading}
          style={[styles.invitationButton, styles.rejectButton, { borderColor: theme.border }]}
        >
          <AppText style={[styles.buttonText, { color: theme.textSecondary }]}>
            Decline
          </AppText>
        </Pressable>
        <Pressable
          onPress={handleAccept}
          disabled={loading}
          style={[styles.invitationButton, styles.acceptButton, { backgroundColor: theme.primary }]}
        >
          <AppText style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {loading ? 'Accepting...' : 'Accept'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ==================== Group Card Component ====================

interface GroupCardProps {
  group: GiftGroup;
  onPress: (groupId: string) => void;
}

function GroupCard({ group, onPress }: GroupCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={() => onPress(group.id)}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <AppText style={[styles.cardTitle, { color: theme.text }]}>
            {group.giftName}
          </AppText>
          {group.status === 'closed' && (
            <View style={[styles.closedBadge, { backgroundColor: theme.textSecondary }]}>
              <AppText style={styles.closedBadgeText}>Closed</AppText>
            </View>
          )}
        </View>
        <AppText style={[styles.cardRecipient, { color: theme.textSecondary }]}>
          For: {group.recipientName || 'Unknown'} {group.recipientAvatar}
        </AppText>
      </View>
      
      {/* Pending invitation badge - will be shown when we add member status to group data */}
      {/* TODO: Add memberStatus to GiftGroup interface and show pending badge */}

      <View style={styles.cardFooter}>
        <View>
          <AppText style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Total Price
          </AppText>
          <AppText style={[styles.cardPrice, { color: theme.primary }]}>
            {group.totalPrice}€
          </AppText>
        </View>
        
        <View style={styles.cardDate}>
          <AppText style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Created
          </AppText>
          <AppText style={[styles.cardDateText, { color: theme.text }]}>
            {formatDate(group.createdAt)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

// ==================== Helper Functions ====================

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.title,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 120,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  toggleText: {
    fontSize: 16,
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
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    fontWeight: '600',
    flex: 1,
  },
  closedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  closedBadgeText: {
    fontSize: 12,
    fontFamily: fonts.text,
    color: '#FFFFFF',
  },
  cardRecipient: {
    fontSize: 14,
    fontFamily: fonts.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: fonts.text,
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 24,
    fontFamily: fonts.title,
    fontWeight: '700',
  },
  cardDate: {
    alignItems: 'flex-end',
  },
  cardDateText: {
    fontSize: 14,
    fontFamily: fonts.text,
  },
  invitationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    fontWeight: '600',
    marginBottom: 12,
  },
  invitationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  invitationHeader: {
    marginBottom: 16,
  },
  invitationTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    fontWeight: '600',
    marginBottom: 4,
  },
  invitationRecipient: {
    fontSize: 14,
    fontFamily: fonts.text,
    marginBottom: 8,
  },
  invitationPrice: {
    fontSize: 20,
    fontFamily: fonts.title,
    fontWeight: '700',
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  invitationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    borderWidth: 1,
  },
  acceptButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
});
