import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { useConnections } from '@/src/context/ConnectionsContext';
import { ChatMessage, useGroups } from '@/src/context/GroupsContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GroupDetailScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const { connectedUsers } = useConnections();
  const insets = useSafeAreaInsets();
  const {
    activeGroup,
    groupMembers,
    groupMessages,
    subscribeToGroup,
    unsubscribeFromGroup,
    sendMessage,
    markAsPaid,
    closeGroup,
    deleteGroup,
    inviteMembers,
    removeMember,
    updateGroupDetails,
    calculatePricePerPerson,
    getPaymentProgress,
  } = useGroups();

  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'details' | 'members'>('chat');
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGiftName, setEditGiftName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTotalPrice, setEditTotalPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      subscribeToGroup(id);
    }

    return () => {
      unsubscribeFromGroup();
    };
  }, [id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (groupMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [groupMessages.length]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !id) return;

    try {
      await sendMessage(id, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTogglePaid = async (memberId: string, currentStatus: boolean) => {
    if (!id || !isCreator) return;

    try {
      await markAsPaid(id, memberId, !currentStatus);
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleBack = () => {
    unsubscribeFromGroup();
    router.back();
  };

  const handleCloseGroup = () => {
    Alert.alert(
      t('group_close_confirm_title'),
      t('group_close_confirm_message'),
      [
        {
          text: t('group_close_confirm_cancel'),
          style: 'cancel',
        },
        {
          text: t('group_close_confirm_button'),
          style: 'destructive',
          onPress: async () => {
            try {
              await closeGroup(id);
              router.back();
            } catch (error) {
              console.error('Error closing group:', error);
            }
          },
        },
      ]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No users selected', 'Please select at least one user to invite');
      return;
    }

    try {
      setIsAddingMembers(true);
      await inviteMembers(id, selectedUsers);
      setShowAddMembersModal(false);
      setSelectedUsers([]);
      Alert.alert('Success', `Invited ${selectedUsers.length} member(s) to the group`);
    } catch (error: any) {
      console.error('Error adding members:', error);
      Alert.alert('Error', error?.message || 'Failed to add members');
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this group?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(id, memberId);
              Alert.alert('Success', `${memberName} has been removed from the group`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleEditGroup = () => {
    if (!activeGroup) return;
    setEditGiftName(activeGroup.giftName);
    setEditDescription(activeGroup.description || '');
    setEditTotalPrice(activeGroup.totalPrice.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editGiftName.trim() || !editTotalPrice.trim()) {
      Alert.alert('Error', 'Gift name and price are required');
      return;
    }

    const price = parseFloat(editTotalPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setIsUpdating(true);
      const updates: Partial<any> = {};
      
      if (editGiftName !== activeGroup?.giftName) {
        updates.giftName = editGiftName;
      }
      if (editDescription !== (activeGroup?.description || '')) {
        updates.description = editDescription;
      }
      if (price !== activeGroup?.totalPrice) {
        updates.totalPrice = price;
      }

      if (Object.keys(updates).length > 0) {
        await updateGroupDetails(id, updates);
        Alert.alert('Success', 'Group updated successfully');
      }
      
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error updating group:', error);
      Alert.alert('Error', error?.message || 'Failed to update group');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to permanently delete this group? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(id);
              router.back();
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  if (!activeGroup) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <AppText style={{ color: theme.textSecondary }}>Loading group...</AppText>
        </View>
      </View>
    );
  }

  const isCreator = activeGroup.creatorId === user?.id;
  const acceptedMembers = groupMembers.filter(m => m.status === 'accepted');
  const pricePerPerson = calculatePricePerPerson(activeGroup, groupMembers);
  const paymentProgress = getPaymentProgress(groupMembers);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <AppText style={{ color: theme.primary, fontSize: 16 }}>← {t('group_back')}</AppText>
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <AppTitle style={styles.headerTitle}>{activeGroup.giftName}</AppTitle>
            {activeGroup.status === 'closed' && (
              <View style={[styles.closedBadge, { backgroundColor: '#EF4444' }]}>
                <AppText style={styles.closedBadgeText}>{t('group_closed_badge')}</AppText>
              </View>
            )}
          </View>
          <AppText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {t('group_for')} {activeGroup.recipientName} {activeGroup.recipientAvatar}
          </AppText>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: theme.surface, borderRadius: 12, padding: 4, marginTop: 12 }]}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'chat' && styles.tabActive,
              activeTab === 'chat' && { backgroundColor: theme.cardBg, borderRadius: 8 }
            ]}
            onPress={() => setActiveTab('chat')}
          >
            <AppText style={[
              styles.tabText,
              { color: theme.textSecondary },
              activeTab === 'chat' && { color: theme.primary, fontWeight: '600' }
            ]}>
              💬 Chat
            </AppText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'details' && styles.tabActive,
              activeTab === 'details' && { backgroundColor: theme.cardBg, borderRadius: 8 }
            ]}
            onPress={() => setActiveTab('details')}
          >
            <AppText style={[
              styles.tabText,
              { color: theme.textSecondary },
              activeTab === 'details' && { color: theme.primary, fontWeight: '600' }
            ]}>
              📋 {t('group_details_tab') || 'Detalles'}
            </AppText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'members' && styles.tabActive,
              activeTab === 'members' && { backgroundColor: theme.cardBg, borderRadius: 8 }
            ]}
            onPress={() => setActiveTab('members')}
          >
            <AppText style={[
              styles.tabText,
              { color: theme.textSecondary },
              activeTab === 'members' && { color: theme.primary, fontWeight: '600' }
            ]}>
              👥 {t('group_members_tab') || 'Miembros'} ({acceptedMembers.length})
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Chat Section - Always visible when chat tab is active */}
      {activeTab === 'chat' && (
        <>
          <View style={styles.chatContent}>
            <FlatList
              ref={flatListRef}
              data={groupMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} currentUserId={user?.id || ''} theme={theme} />
              )}
              contentContainerStyle={styles.messagesList}
              style={styles.chatList}
            />
          </View>

          {/* Message Input */}
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: theme.surface, 
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 12),
            }
          ]}>
            <TextInput
              style={[
                styles.messageInput,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder={t('group_chat_placeholder')}
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: messageText.trim() ? theme.primary : theme.border,
                }
              ]}
            >
              <AppText style={styles.sendButtonText}>{t('group_chat_send')}</AppText>
            </Pressable>
          </View>
        </>
      )}

      {/* Details Tab Content */}
      {activeTab === 'details' && (
        <ScrollView style={styles.tabContent}>
          {/* Description */}
          {activeGroup.description && (
            <View style={[styles.descriptionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <AppText style={[styles.descriptionLabel, { color: theme.textSecondary }]}>
                {t('group_about_gift')}
              </AppText>
              <AppText style={[styles.descriptionText, { color: theme.text }]}>
                {activeGroup.description}
              </AppText>
            </View>
          )}

          {/* Member Deadline */}
          {activeGroup.memberDeadline && (
            <View style={[styles.deadlineCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <AppText style={[styles.deadlineLabel, { color: theme.textSecondary }]}>
                {t('group_deadline_label')} {t('group_deadline_dont_pay')}
              </AppText>
              <AppText style={[styles.deadlineDate, { color: theme.primary }]}>
                {activeGroup.memberDeadline.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </AppText>
              <AppText style={[styles.deadlineHelper, { color: theme.textMuted }]}>
                {new Date() > activeGroup.memberDeadline 
                  ? t('group_deadline_passed')
                  : t('group_deadline_active')}
              </AppText>
            </View>
          )}

          {/* Birthday */}
          {activeGroup.recipientBirthdate && (
            <View style={[styles.infoCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <AppText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                {t('group_birthday')}
              </AppText>
              <AppText style={[styles.infoValue, { color: theme.text }]}>
                {activeGroup.recipientBirthdate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </AppText>
            </View>
          )}

          {/* Price Info */}
          <View style={[styles.priceCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.priceRow}>
              <View>
                <AppText style={[styles.priceLabel, { color: theme.textSecondary }]}>
                  {t('group_total_price')}
                </AppText>
                <AppText style={[styles.priceValue, { color: theme.primary }]}>
                  {activeGroup.totalPrice}€
                </AppText>
              </View>
              <View style={styles.pricePerPerson}>
                <AppText style={[styles.priceLabel, { color: theme.textSecondary }]}>
                  {activeGroup.memberDeadline && new Date() <= activeGroup.memberDeadline 
                    ? t('group_per_person_estimated')
                    : t('group_per_person')}
                </AppText>
                <AppText style={[styles.priceValue, { color: theme.text }]}>
                  {pricePerPerson.toFixed(2)}€
                </AppText>
              </View>
            </View>

            {/* Payment Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <AppText style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  {t('group_payment_progress')}
                </AppText>
                <AppText style={[styles.progressText, { color: theme.text }]}>
                  {t('group_payment_status', { paid: paymentProgress.paid.toString(), total: paymentProgress.total.toString() })}
                </AppText>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: paymentProgress.percentage === 100 ? '#4CAF50' : theme.primary,
                      width: `${paymentProgress.percentage}%`,
                    }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Admin Actions (Active groups only) */}
          {isCreator && activeGroup.status === 'active' && (
            <View style={styles.adminActions}>
              <Pressable
                onPress={handleEditGroup}
                style={[styles.actionButton, styles.editButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
              >
                <AppText style={styles.actionButtonText}>✏️ Edit Group</AppText>
              </Pressable>
              
              <Pressable
                onPress={handleCloseGroup}
                style={[styles.actionButton, styles.closeButton, { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]}
              >
                <AppText style={styles.actionButtonText}>{t('group_close_button')}</AppText>
              </Pressable>
              
              <Pressable
                onPress={handleDeleteGroup}
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
              >
                <AppText style={styles.actionButtonText}>🗑️ Delete Group</AppText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Members Tab Content */}
      {activeTab === 'members' && (
        <ScrollView style={styles.tabContent}>
          <View style={styles.membersHeader}>
            <AppText style={[styles.sectionTitle, { color: theme.text }]}>
              {t('group_members_title', { count: acceptedMembers.length.toString() })}
            </AppText>
            {isCreator && activeGroup.status === 'active' && (
              <Pressable
                onPress={() => setShowAddMembersModal(true)}
                style={[styles.addMemberButton, { backgroundColor: theme.primary }]}
              >
                <AppText style={styles.addMemberButtonText}>+ Add Members</AppText>
              </Pressable>
            )}
          </View>
          {groupMembers.map((member) => (
            <View
              key={member.id}
              style={[styles.memberCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            >
              <View style={styles.memberInfo}>
                <AppText style={styles.memberAvatar}>{member.avatar}</AppText>
                <View style={styles.memberDetails}>
                  <AppText style={[styles.memberName, { color: theme.text }]}>
                    {member.username}
                    {member.role === 'creator' && ` ${t('group_member_admin')}`}
                  </AppText>
                  <AppText style={[styles.memberStatus, { color: theme.textSecondary }]}>
                    {member.status === 'pending' ? t('group_member_pending') : member.hasPaid ? t('group_member_paid') : t('group_member_not_paid')}
                  </AppText>
                </View>
                {member.status === 'accepted' && (
                  <View style={styles.memberPayment}>
                    <AppText style={[styles.paymentAmount, { color: theme.primary }]}>
                      {pricePerPerson.toFixed(2)}€
                    </AppText>
                  </View>
                )}
              </View>

              <View style={styles.memberActions}>
                {isCreator && member.status === 'accepted' && (
                  <Pressable
                    onPress={() => handleTogglePaid(member.userId, member.hasPaid)}
                    style={[
                      styles.paidCheckbox,
                      {
                        backgroundColor: member.hasPaid ? theme.primary : 'transparent',
                        borderColor: member.hasPaid ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    {member.hasPaid && (
                      <AppText style={styles.checkmark}>✓</AppText>
                    )}
                  </Pressable>
                )}
                {isCreator && member.userId !== user?.id && activeGroup.status === 'active' && (
                  <Pressable
                    onPress={() => handleRemoveMember(member.userId, member.username)}
                    style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                  >
                    <AppText style={styles.removeButtonText}>Remove</AppText>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Members Modal */}
      <Modal
        visible={showAddMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <AppTitle style={[styles.modalTitle, { color: theme.text }]}>Add Members</AppTitle>
              <Pressable onPress={() => setShowAddMembersModal(false)}>
                <AppText style={[styles.modalClose, { color: theme.textSecondary }]}>✕</AppText>
              </Pressable>
            </View>

            <AppText style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Select users to invite to this group
            </AppText>

            <ScrollView style={styles.usersList}>
              {connectedUsers
                .filter(connectedUser => {
                  // Filter out users already in the group
                  const isAlreadyMember = groupMembers.some(m => m.userId === connectedUser.id);
                  // Filter out the recipient
                  const isRecipient = connectedUser.id === activeGroup.recipientUserId;
                  return !isAlreadyMember && !isRecipient;
                })
                .map((connectedUser) => (
                  <Pressable
                    key={connectedUser.id}
                    onPress={() => toggleUserSelection(connectedUser.id)}
                    style={[
                      styles.userItem,
                      {
                        backgroundColor: selectedUsers.includes(connectedUser.id) ? theme.primary + '20' : theme.surface,
                        borderColor: selectedUsers.includes(connectedUser.id) ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <AppText style={styles.userAvatar}>{connectedUser.avatar}</AppText>
                    <AppText style={[styles.userName, { color: theme.text }]}>
                      {connectedUser.name}
                    </AppText>
                    {selectedUsers.includes(connectedUser.id) && (
                      <AppText style={[styles.selectedCheck, { color: theme.primary }]}>✓</AppText>
                    )}
                  </Pressable>
                ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowAddMembersModal(false)}
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
              >
                <AppText style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</AppText>
              </Pressable>
              <Pressable
                onPress={handleAddMembers}
                disabled={selectedUsers.length === 0 || isAddingMembers}
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  {
                    backgroundColor: selectedUsers.length > 0 && !isAddingMembers ? theme.primary : theme.border,
                  }
                ]}
              >
                <AppText style={styles.confirmButtonText}>
                  {isAddingMembers ? 'Adding...' : `Add ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <AppTitle style={[styles.modalTitle, { color: theme.text }]}>Edit Group</AppTitle>
              <Pressable onPress={() => setShowEditModal(false)}>
                <AppText style={[styles.modalClose, { color: theme.textSecondary }]}>✕</AppText>
              </Pressable>
            </View>

            <ScrollView style={styles.editForm}>
              <View style={styles.formGroup}>
                <AppText style={[styles.formLabel, { color: theme.text }]}>Gift Name *</AppText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                  value={editGiftName}
                  onChangeText={setEditGiftName}
                  placeholder="e.g., Birthday Gift"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <AppText style={[styles.formLabel, { color: theme.text }]}>Description</AppText>
                <TextInput
                  style={[styles.formInput, styles.textArea, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="What are we getting?"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <AppText style={[styles.formLabel, { color: theme.text }]}>Total Price (€) *</AppText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                  value={editTotalPrice}
                  onChangeText={setEditTotalPrice}
                  placeholder="0.00"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
              >
                <AppText style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</AppText>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={isUpdating}
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: !isUpdating ? theme.primary : theme.border }
                ]}
              >
                <AppText style={styles.confirmButtonText}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==================== Message Bubble Component ====================

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
  theme: any;
}

function MessageBubble({ message, currentUserId, theme }: MessageBubbleProps) {
  const isSystem = message.type === 'system';
  const isOwn = message.senderId === currentUserId;

  if (isSystem) {
    return (
      <View style={styles.systemMessage}>
        <AppText style={[styles.systemMessageText, { color: theme.textMuted }]}>
          {message.message}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.messageBubble, isOwn && styles.ownMessage]}>
      <View style={styles.messageHeader}>
        <AppText style={styles.messageAvatar}>{message.senderAvatar}</AppText>
        <AppText style={[styles.messageSender, { color: theme.textSecondary }]}>
          {message.senderName}
        </AppText>
      </View>
      <View style={[
        styles.messageContent,
        {
          backgroundColor: isOwn ? theme.primary + '20' : theme.inputBg,
          borderColor: theme.border,
        }
      ]}>
        <AppText style={[styles.messageText, { color: theme.text }]}>
          {message.message}
        </AppText>
      </View>
      <AppText style={[styles.messageTime, { color: theme.textMuted }]}>
        {formatTime(message.timestamp)}
      </AppText>
    </View>
  );
}

// ==================== Helper Functions ====================

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginBottom: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.title,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  closedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  headerBirthday: {
    fontSize: 13,
    fontFamily: fonts.text,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.text,
  },
  chatContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatList: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  descriptionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: fonts.text,
    lineHeight: 22,
  },
  deadlineCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deadlineLabel: {
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  deadlineDate: {
    fontSize: 18,
    fontFamily: fonts.title,
    fontWeight: '700',
    marginBottom: 4,
  },
  deadlineHelper: {
    fontSize: 13,
    fontFamily: fonts.text,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontFamily: fonts.text,
    lineHeight: 22,
  },
  priceCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pricePerPerson: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: fonts.text,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontFamily: fonts.title,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.text,
  },
  progressText: {
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    fontWeight: '600',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 12,
    fontFamily: fonts.text,
  },
  memberPayment: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontFamily: fonts.title,
    fontWeight: '700',
  },
  paidCheckbox: {
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
  chatContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 200,
    maxHeight: 400,
  },
  messagesList: {
    paddingBottom: 8,
  },
  messageBubble: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageAvatar: {
    fontSize: 16,
    marginRight: 4,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  messageContent: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.text,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: fonts.text,
    marginTop: 2,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    fontFamily: fonts.text,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: fonts.text,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMemberButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMemberButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.title,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '300',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: fonts.text,
    marginBottom: 16,
  },
  usersList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  userAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.text,
  },
  selectedCheck: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  confirmButton: {
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  adminActions: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  editButton: {
  },
  deleteButton: {
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.text,
    fontWeight: '600',
  },
  editForm: {
    maxHeight: 400,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: fonts.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
