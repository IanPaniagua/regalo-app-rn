import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { ChatMessage, useGroups } from '@/src/context/GroupsContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GroupDetailScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
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
    calculatePricePerPerson,
    getPaymentProgress,
  } = useGroups();

  const [messageText, setMessageText] = useState('');
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
          {activeGroup.recipientBirthdate && (
            <AppText style={[styles.headerBirthday, { color: theme.textMuted }]}>
              {t('group_birthday')}: {activeGroup.recipientBirthdate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </AppText>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
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

        {/* Members List */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.text }]}>
            {t('group_members_title', { count: acceptedMembers.length.toString() })}
          </AppText>
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
            </View>
          ))}
        </View>

        {/* Close Group Button (Admin only, Active groups only) */}
        {isCreator && activeGroup.status === 'active' && (
          <View style={styles.section}>
            <Pressable
              onPress={handleCloseGroup}
              style={[styles.closeButton, { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
            >
              <AppText style={styles.closeButtonText}>{t('group_close_button')}</AppText>
            </Pressable>
          </View>
        )}

        {/* Chat Section */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
            {t('group_chat_title')}
          </AppText>
          <View style={[styles.chatContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <FlatList
              ref={flatListRef}
              data={groupMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} currentUserId={user?.id || ''} theme={theme} />
              )}
              contentContainerStyle={styles.messagesList}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>

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
});
