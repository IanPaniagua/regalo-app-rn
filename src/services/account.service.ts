import { db } from '@/src/database';
import { deleteUser as firebaseDeleteUser, getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, query, where, writeBatch } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

/**
 * Service for account management operations
 */
export class AccountService {
  
  /**
   * Delete user account completely
   * This will:
   * 1. Remove user from all groups
   * 2. Delete all manual birthdays
   * 3. Delete all connections
   * 4. Delete user document from Firestore
   * 5. Delete Firebase Auth account
   */
  async deleteAccount(userId: string): Promise<void> {
    try {
      console.log('🗑️ Starting account deletion for user:', userId);
      
      const firestore = getFirestore(getFirebaseApp());
      const batch = writeBatch(firestore);
      
      // 1. Get user data
      const user = await db.getAdapter().getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // 2. Remove user from all groups they're a member of
      if (user.groupIds && user.groupIds.length > 0) {
        console.log('📦 Removing user from groups...');
        for (const groupId of user.groupIds) {
          const memberRef = doc(firestore, `giftGroups/${groupId}/members/${userId}`);
          batch.delete(memberRef);
        }
      }
      
      // 3. Delete all groups where user is the creator
      console.log('🗑️ Deleting groups created by user...');
      const groupsQuery = query(
        collection(firestore, 'giftGroups'),
        where('creatorId', '==', userId)
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      
      for (const groupDoc of groupsSnapshot.docs) {
        const groupId = groupDoc.id;
        
        // Delete all members
        const membersSnapshot = await getDocs(collection(firestore, `giftGroups/${groupId}/members`));
        for (const memberDoc of membersSnapshot.docs) {
          batch.delete(memberDoc.ref);
        }
        
        // Delete all messages
        const messagesSnapshot = await getDocs(collection(firestore, `giftGroups/${groupId}/messages`));
        for (const messageDoc of messagesSnapshot.docs) {
          batch.delete(messageDoc.ref);
        }
        
        // Delete group
        batch.delete(groupDoc.ref);
      }
      
      // 4. Delete all connections where user is involved
      console.log('🔗 Deleting connections...');
      const connectionsQuery1 = query(
        collection(firestore, 'connections'),
        where('userId', '==', userId)
      );
      const connectionsQuery2 = query(
        collection(firestore, 'connections'),
        where('connectedUserId', '==', userId)
      );
      
      const [connections1, connections2] = await Promise.all([
        getDocs(connectionsQuery1),
        getDocs(connectionsQuery2)
      ]);
      
      for (const conn of [...connections1.docs, ...connections2.docs]) {
        batch.delete(conn.ref);
      }
      
      // 5. Delete user document
      console.log('👤 Deleting user document...');
      const userRef = doc(firestore, 'users', userId);
      batch.delete(userRef);
      
      // Commit all deletions
      await batch.commit();
      console.log('✅ Firestore data deleted');
      
      // 6. Delete Firebase Auth account
      console.log('🔐 Deleting Firebase Auth account...');
      const auth = getAuth(getFirebaseApp());
      const currentUser = auth.currentUser;
      
      if (currentUser && currentUser.uid === userId) {
        await firebaseDeleteUser(currentUser);
        console.log('✅ Firebase Auth account deleted');
      } else {
        console.warn('⚠️ Current user does not match userId, skipping Auth deletion');
      }
      
      console.log('✅ Account deletion completed successfully');
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      throw error;
    }
  }
  
  /**
   * Validate if account can be deleted
   * Returns any warnings or blockers
   */
  async validateAccountDeletion(userId: string): Promise<{
    canDelete: boolean;
    warnings: string[];
    blockers: string[];
  }> {
    const warnings: string[] = [];
    const blockers: string[] = [];
    
    try {
      const user = await db.getAdapter().getUser(userId);
      
      if (!user) {
        blockers.push('User not found');
        return { canDelete: false, warnings, blockers };
      }
      
      // Check for active groups
      if (user.groupIds && user.groupIds.length > 0) {
        warnings.push(`You are a member of ${user.groupIds.length} group(s). These will be removed.`);
      }
      
      // Check for manual birthdays
      if (user.manualBirthdays && user.manualBirthdays.length > 0) {
        warnings.push(`You have ${user.manualBirthdays.length} manual birthday(s). These will be deleted.`);
      }
      
      return {
        canDelete: blockers.length === 0,
        warnings,
        blockers
      };
    } catch (error) {
      console.error('Error validating account deletion:', error);
      blockers.push('Unable to validate account deletion');
      return { canDelete: false, warnings, blockers };
    }
  }
}

export const accountService = new AccountService();
