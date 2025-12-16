import { useUser } from '@/src/context/UserContext';
import { db } from '@/src/database/index';
import { getFirebaseApp } from '@/src/services/firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, orderBy, query, setDoc, Timestamp, Unsubscribe, updateDoc } from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationsContext';

// ==================== TypeScript Interfaces ====================

export interface GiftGroup {
  id: string;
  giftName: string;
  description?: string; // Optional description explaining the gift
  totalPrice: number;
  recipientUserId: string;
  recipientName?: string;
  recipientAvatar?: string;
  recipientBirthdate?: Date; // Recipient's birthday
  creatorId: string;
  status: 'active' | 'closed';
  memberDeadline?: Date; // Deadline to accept new members
  paymentLink?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  memberStatus?: 'pending' | 'accepted' | 'rejected'; // User's membership status in this group
}

export interface GroupMember {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  role: 'creator' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
  hasPaid: boolean;
  invitedAt: Date;
  joinedAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  type: 'user' | 'system';
  timestamp: Date;
}

export interface CreateGroupData {
  giftName: string;
  description?: string;
  totalPrice: number;
  recipientUserId: string;
  memberDeadline?: Date;
}

// ==================== Context Interface ====================

interface GroupsContextType {
  // State
  myGroups: GiftGroup[];
  pendingInvitations: GiftGroup[];
  activeGroups: GiftGroup[];
  closedGroups: GiftGroup[];
  activeGroup: GiftGroup | null;
  groupMembers: GroupMember[];
  groupMessages: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  createGroup: (data: CreateGroupData) => Promise<string>;
  inviteMembers: (groupId: string, userIds: string[]) => Promise<void>;
  acceptInvite: (groupId: string) => Promise<void>;
  rejectInvite: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, message: string) => Promise<void>;
  markAsPaid: (groupId: string, userId: string, paid: boolean) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: Partial<GiftGroup>) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  closeGroup: (groupId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToGroup: (groupId: string) => void;
  unsubscribeFromGroup: () => void;
  
  // Helpers
  calculatePricePerPerson: (group: GiftGroup, members: GroupMember[]) => number;
  getPaymentProgress: (members: GroupMember[]) => { paid: number; total: number; percentage: number };
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

// ==================== Provider Component ====================

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { scheduleLocalNotification } = useNotifications();
  
  // State
  const [myGroups, setMyGroups] = useState<GiftGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<GiftGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Unsubscribe functions
  const [groupUnsubscribe, setGroupUnsubscribe] = useState<Unsubscribe | null>(null);
  const [membersUnsubscribe, setMembersUnsubscribe] = useState<Unsubscribe | null>(null);
  const [messagesUnsubscribe, setMessagesUnsubscribe] = useState<Unsubscribe | null>(null);
  
  // Computed values
  const pendingInvitations = myGroups.filter(g => g.memberStatus === 'pending');
  const activeGroups = myGroups.filter(g => g.status === 'active' && g.memberStatus === 'accepted');
  const closedGroups = myGroups.filter(g => g.status === 'closed' && g.memberStatus === 'accepted');
  
  // ==================== Load User's Groups ====================
  
  useEffect(() => {
    if (!user?.id) {
      setMyGroups([]);
      return;
    }
    
    loadMyGroups();
  }, [user?.id]);
  
  const loadMyGroups = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      const firestore = getFirestore(getFirebaseApp());
      const userGroups: GiftGroup[] = [];
      const processedGroupIds = new Set<string>();
      
      // 1. Reload user document from Firestore to get latest groupIds
      console.log('🔄 Reloading user document from Firestore...');
      const freshUserData = await db.getAdapter().getUser(user.id);
      const groupIds = freshUserData?.groupIds || [];
      
      console.log(`📋 Found ${groupIds.length} groups in user document:`, groupIds);
      
      // 2. Get groups from user's groupIds array
      for (const groupId of groupIds) {
        try {
          const groupRef = doc(firestore, 'giftGroups', groupId);
          const groupDoc = await getDoc(groupRef);
          
          if (groupDoc.exists()) {
            processedGroupIds.add(groupId);
            const data = groupDoc.data();
            
            // Get user's member status in this group
            const memberRef = doc(firestore, `giftGroups/${groupId}/members/${user.id}`);
            const memberDoc = await getDoc(memberRef);
            const memberStatus = memberDoc.exists() ? memberDoc.data()?.status : 'pending';
            
            userGroups.push({
              id: groupDoc.id,
              giftName: data.giftName,
              description: data.description,
              totalPrice: data.totalPrice,
              recipientUserId: data.recipientUserId,
              recipientName: data.recipientName,
              recipientAvatar: data.recipientAvatar,
              recipientBirthdate: data.recipientBirthdate?.toDate(),
              creatorId: data.creatorId,
              status: data.status,
              memberDeadline: data.memberDeadline?.toDate(),
              paymentLink: data.paymentLink,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              closedAt: data.closedAt?.toDate(),
              memberStatus: memberStatus,
            });
            console.log(`  ✅ Loaded group: ${data.giftName} (status: ${memberStatus})`);
          }
        } catch (error) {
          console.error(`❌ Error loading group ${groupId}:`, error);
        }
      }
      
      // NOTE: Pending invitations will be handled by Cloud Functions
      // When a user is invited, a Cloud Function will add the groupId to their document
      // This avoids permissions issues with collectionGroup queries
      
      // Sort by most recent first
      userGroups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setMyGroups(userGroups);
      console.log('✅ Loaded user groups:', userGroups.length);
    } catch (error) {
      console.error('❌ Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== Create Group ====================
  
  const createGroup = async (data: CreateGroupData): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      
      // Get recipient details
      const firestore = getFirestore(getFirebaseApp());
      const recipientRef = doc(firestore, 'users', data.recipientUserId);
      const recipientDoc = await getDoc(recipientRef);
      const recipientData = recipientDoc.data();
      
      // Create group document
      const groupsRef = collection(firestore, 'giftGroups');
      const groupDoc = await addDoc(groupsRef, {
        giftName: data.giftName,
        description: data.description || null,
        totalPrice: data.totalPrice,
        recipientUserId: data.recipientUserId,
        recipientName: recipientData?.name || 'Unknown',
        recipientAvatar: recipientData?.avatar || '🎁',
        recipientBirthdate: recipientData?.birthdate || null,
        creatorId: user.id,
        status: 'active',
        memberDeadline: data.memberDeadline ? Timestamp.fromDate(data.memberDeadline) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      const groupId = groupDoc.id;
      
      // Add creator as first member (use userId as document ID)
      const memberRef = doc(firestore, `giftGroups/${groupId}/members/${user.id}`);
      await setDoc(memberRef, {
        userId: user.id,
        username: user.username || user.name,
        avatar: user.avatar || '🎉',
        role: 'creator',
        status: 'accepted',
        hasPaid: false,
        invitedAt: Timestamp.now(),
        joinedAt: Timestamp.now(),
      });
      
      // Add system message
      await sendSystemMessage(groupId, `${user.name} created the group`);
      
      // Add groupId to creator's user document
      await db.getAdapter().updateUser(user.id, {
        groupIds: [...(user.groupIds || []), groupId]
      });
      
      // Reload groups
      await loadMyGroups();
      
      console.log('✅ Group created:', groupId);
      return groupId;
    } catch (error) {
      console.error('❌ Error creating group:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== Invite Members ====================
  
  const inviteMembers = async (groupId: string, userIds: string[]): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      
      const firestore = getFirestore(getFirebaseApp());
      
      // Check if deadline has passed
      const groupRef = doc(firestore, 'giftGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();
      
      if (groupData?.memberDeadline) {
        const deadline = groupData.memberDeadline.toDate();
        if (new Date() > deadline) {
          throw new Error('Member acceptance deadline has passed. No new members can be invited.');
        }
      }
      
      for (const userId of userIds) {
        // Get user details
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        
        if (!userData) continue;
        
        // Check if already invited
        const checkMemberRef = doc(firestore, `giftGroups/${groupId}/members/${userId}`);
        const memberDoc = await getDoc(checkMemberRef);
        
        if (memberDoc.exists()) {
          console.log('⚠️ User already invited:', userId);
          continue;
        }
        
        // Add member with pending status (use userId as document ID)
        const newMemberRef = doc(firestore, `giftGroups/${groupId}/members/${userId}`);
        await setDoc(newMemberRef, {
          userId: userId,
          username: userData.username || userData.name,
          avatar: userData.avatar || '🎉',
          role: 'member',
          status: 'pending',
          hasPaid: false,
          invitedAt: Timestamp.now(),
        });
        
        // Send system message
        await sendSystemMessage(groupId, `${user.name} invited ${userData.name}`);
        
        // NOTE: Push notification and groupId sync handled by Cloud Function (onGroupMemberAdded)
      }
      
      console.log('✅ Members invited:', userIds.length);
    } catch (error) {
      console.error('❌ Error inviting members:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== Accept/Reject Invite ====================
  
  const acceptInvite = async (groupId: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      
      // Check if deadline has passed
      const groupRef = doc(firestore, 'giftGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();
      
      if (groupData?.memberDeadline) {
        const deadline = groupData.memberDeadline.toDate();
        if (new Date() > deadline) {
          throw new Error('Member acceptance deadline has passed. You can no longer join this group.');
        }
      }
      
      // Update member status to accepted
      const memberRef = doc(firestore, `giftGroups/${groupId}/members/${user.id}`);
      await updateDoc(memberRef, {
        status: 'accepted',
        joinedAt: Timestamp.now(),
      });
      
      await sendSystemMessage(groupId, `${user.name} joined the group`);
      
      // Add groupId to user's document when they accept
      if (user.groupIds && !user.groupIds.includes(groupId)) {
        await db.getAdapter().updateUser(user.id, {
          groupIds: [...user.groupIds, groupId]
        });
      } else if (!user.groupIds) {
        await db.getAdapter().updateUser(user.id, {
          groupIds: [groupId]
        });
      }
      
      // NOTE: Push notification to creator handled by Cloud Function (onGroupMemberAccepted)
      
      await loadMyGroups();
      
      console.log('✅ Invite accepted');
    } catch (error) {
      console.error('❌ Error accepting invite:', error);
      throw error;
    }
  };
  
  const rejectInvite = async (groupId: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      const memberRef = doc(firestore, `giftGroups/${groupId}/members/${user.id}`);
      await updateDoc(memberRef, {
        status: 'rejected',
      });
      
      // Remove groupId from user's document since they rejected
      if (user.groupIds) {
        await db.getAdapter().updateUser(user.id, {
          groupIds: user.groupIds.filter(id => id !== groupId)
        });
      }
      
      await sendSystemMessage(groupId, `${user.name} declined the invitation`);
      await loadMyGroups();
      
      console.log('✅ Invite rejected');
    } catch (error) {
      console.error('❌ Error rejecting invite:', error);
      throw error;
    }
  };
  
  // ==================== Send Message ====================
  
  const sendMessage = async (groupId: string, message: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    if (!message.trim()) return;
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      const messagesRef = collection(firestore, `giftGroups/${groupId}/messages`);
      await addDoc(messagesRef, {
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar || '🎉',
        message: message.trim(),
        type: 'user',
        timestamp: Timestamp.now(),
      });
      
      console.log('✅ Message sent');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  };
  
  const sendSystemMessage = async (groupId: string, message: string): Promise<void> => {
    try {
      const firestore = getFirestore(getFirebaseApp());
      const messagesRef = collection(firestore, `giftGroups/${groupId}/messages`);
      await addDoc(messagesRef, {
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '🎁',
        message: message,
        type: 'system',
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('❌ Error sending system message:', error);
    }
  };
  
  // ==================== Payment Tracking ====================
  
  const markAsPaid = async (groupId: string, userId: string, paid: boolean): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      const memberRef = doc(firestore, `giftGroups/${groupId}/members/${userId}`);
      await updateDoc(memberRef, {
        hasPaid: paid,
      });
      
      // Get member name for system message
      const memberDoc = await getDoc(memberRef);
      const memberData = memberDoc.data();
      const memberName = memberData?.username || 'Member';
      
      await sendSystemMessage(
        groupId, 
        paid ? `${memberName} marked as paid` : `${memberName} marked as unpaid`
      );
      
      // NOTE: Push notification handled by Cloud Function (onMemberPaymentUpdated)
      
      console.log('✅ Payment status updated');
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      throw error;
    }
  };
  
  // ==================== Update Group Details ====================
  
  const updateGroupDetails = async (groupId: string, updates: Partial<GiftGroup>): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      const groupRef = doc(firestore, `giftGroups/${groupId}`);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Remove computed fields
      delete updateData.id;
      delete updateData.createdAt;
      
      await updateDoc(groupRef, updateData);
      
      // Send system message for price changes
      if (updates.totalPrice !== undefined) {
        await sendSystemMessage(groupId, `${user.name} updated the price to ${updates.totalPrice}€`);
      }
      
      if (updates.giftName !== undefined) {
        await sendSystemMessage(groupId, `${user.name} updated the gift name to "${updates.giftName}"`);
      }
      
      await loadMyGroups();
      console.log('✅ Group updated');
    } catch (error) {
      console.error('❌ Error updating group:', error);
      throw error;
    }
  };
  
  // ==================== Remove Member ====================
  
  const removeMember = async (groupId: string, userId: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      // Get member name before deleting
      const memberRef = doc(firestore, `giftGroups/${groupId}/members/${userId}`);
      const memberDoc = await getDoc(memberRef);
      const memberData = memberDoc.data();
      const memberName = memberData?.username || 'Member';
      
      // Delete member
      await deleteDoc(memberRef);
      
      // Remove groupId from user's document
      const removedUser = await db.getAdapter().getUser(userId);
      if (removedUser && removedUser.groupIds) {
        await db.getAdapter().updateUser(userId, {
          groupIds: removedUser.groupIds.filter(id => id !== groupId)
        });
      }
      
      await sendSystemMessage(groupId, `${user.name} removed ${memberName} from the group`);
      
      console.log('✅ Member removed');
    } catch (error) {
      console.error('❌ Error removing member:', error);
      throw error;
    }
  };
  
  // ==================== Close Group ====================
  
  const closeGroup = async (groupId: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const firestore = getFirestore(getFirebaseApp());
      const groupRef = doc(firestore, `giftGroups/${groupId}`);
      await updateDoc(groupRef, {
        status: 'closed',
        closedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      await sendSystemMessage(groupId, `${user.name} closed the group`);
      await loadMyGroups();
      
      console.log('✅ Group closed');
    } catch (error) {
      console.error('❌ Error closing group:', error);
      throw error;
    }
  };
  
  // ==================== Real-time Subscriptions ====================
  
  const subscribeToGroup = useCallback((groupId: string) => {
    console.log('🔔 Subscribing to group:', groupId);
    console.log('👤 Current user:', user?.id);
    
    // Unsubscribe from previous subscriptions
    unsubscribeFromGroup();
    
    const firestore = getFirestore(getFirebaseApp());
    
    // Subscribe to group document
    const groupRef = doc(firestore, `giftGroups/${groupId}`);
    const groupUnsub = onSnapshot(groupRef, (snapshot) => {
      console.log(`📡 Group subscription update for ${groupId}:`, snapshot.exists());
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log(`  ✅ Group data loaded: ${data.giftName} (status: ${data.status})`);
        setActiveGroup({
          id: snapshot.id,
          giftName: data.giftName,
          description: data.description,
          totalPrice: data.totalPrice,
          recipientUserId: data.recipientUserId,
          recipientName: data.recipientName,
          recipientAvatar: data.recipientAvatar,
          recipientBirthdate: data.recipientBirthdate?.toDate(),
          creatorId: data.creatorId,
          status: data.status,
          memberDeadline: data.memberDeadline?.toDate(),
          paymentLink: data.paymentLink,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate(),
        });
      } else {
        console.log(`  ❌ Group ${groupId} does not exist or no permission`);
        setActiveGroup(null);
      }
    }, (error) => {
      console.error(`❌ Error subscribing to group ${groupId}:`, error);
      setActiveGroup(null);
    });
    
    // Subscribe to members
    const membersRef = collection(firestore, `giftGroups/${groupId}/members`);
    const membersQuery = query(membersRef, orderBy('invitedAt', 'asc'));
    const membersUnsub = onSnapshot(membersQuery, (snapshot) => {
      const members: GroupMember[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          username: data.username,
          avatar: data.avatar,
          role: data.role,
          status: data.status,
          hasPaid: data.hasPaid,
          invitedAt: data.invitedAt?.toDate() || new Date(),
          joinedAt: data.joinedAt?.toDate(),
        };
      });
      setGroupMembers(members);
    });
    
    // Subscribe to messages
    const messagesRef = collection(firestore, `giftGroups/${groupId}/messages`);
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    const messagesUnsub = onSnapshot(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          message: data.message,
          type: data.type,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });
      setGroupMessages(messages);
    });
    
    setGroupUnsubscribe(() => groupUnsub);
    setMembersUnsubscribe(() => membersUnsub);
    setMessagesUnsubscribe(() => messagesUnsub);
    
    console.log('✅ Subscribed to group:', groupId);
  }, []);
  
  const unsubscribeFromGroup = useCallback(() => {
    if (groupUnsubscribe) {
      groupUnsubscribe();
      setGroupUnsubscribe(null);
    }
    if (membersUnsubscribe) {
      membersUnsubscribe();
      setMembersUnsubscribe(null);
    }
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
      setMessagesUnsubscribe(null);
    }
    
    setActiveGroup(null);
    setGroupMembers([]);
    setGroupMessages([]);
    
    console.log('✅ Unsubscribed from group');
  }, [groupUnsubscribe, membersUnsubscribe, messagesUnsubscribe]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromGroup();
    };
  }, [unsubscribeFromGroup]);
  
  // ==================== Helper Functions ====================
  
  // Helper function to calculate price per person
  const calculatePricePerPerson = (group: GiftGroup, members: GroupMember[]): number => {
    // If deadline has passed, calculate with only accepted members (final price)
    const deadlinePassed = group.memberDeadline ? new Date() > group.memberDeadline : false;

    if (deadlinePassed) {
      const acceptedMembers = members.filter(m => m.status === 'accepted');
      if (acceptedMembers.length === 0) return group.totalPrice;
      return group.totalPrice / acceptedMembers.length;
    }

    // Before deadline, calculate with all invited members (estimated price)
    // This includes pending and accepted members
    const invitedMembers = members.filter(m => m.status === 'pending' || m.status === 'accepted');
    if (invitedMembers.length === 0) return group.totalPrice;
    return group.totalPrice / invitedMembers.length;
  };
  
  const getPaymentProgress = (members: GroupMember[]): { paid: number; total: number; percentage: number } => {
    const acceptedMembers = members.filter(m => m.status === 'accepted');
    const paidMembers = acceptedMembers.filter(m => m.hasPaid);
    
    return {
      paid: paidMembers.length,
      total: acceptedMembers.length,
      percentage: acceptedMembers.length > 0 ? (paidMembers.length / acceptedMembers.length) * 100 : 0,
    };
  };
  
  // ==================== Context Value ====================
  
  const value: GroupsContextType = {
    // State
    myGroups,
    pendingInvitations,
    activeGroups,
    closedGroups,
    activeGroup,
    groupMembers,
    groupMessages,
    isLoading,
    
    // Actions
    createGroup,
    inviteMembers,
    acceptInvite,
    rejectInvite,
    sendMessage,
    markAsPaid,
    updateGroupDetails,
    removeMember,
    closeGroup,
    
    // Real-time
    subscribeToGroup,
    unsubscribeFromGroup,
    
    // Helpers
    calculatePricePerPerson,
    getPaymentProgress,
  };
  
  return (
    <GroupsContext.Provider value={value}>
      {children}
    </GroupsContext.Provider>
  );
}

// ==================== Hook ====================

export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
}
