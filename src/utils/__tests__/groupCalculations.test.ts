import { GiftGroup, GroupMember } from '../../context/GroupsContext';
import {
    calculatePricePerPerson,
    canAcceptInvitation,
    canInviteMembers,
    isDeadlinePassed,
} from '../groupCalculations';

describe('Group Calculations - Price Per Person', () => {
  const baseGroup: GiftGroup = {
    id: 'test-group-1',
    giftName: 'Test Gift',
    totalPrice: 300,
    recipientUserId: 'recipient-1',
    creatorId: 'creator-1',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const createMember = (userId: string, status: 'pending' | 'accepted' | 'rejected'): GroupMember => ({
    id: userId,
    userId,
    username: `User ${userId}`,
    avatar: '👤',
    role: userId === 'creator-1' ? 'creator' : 'member',
    status,
    hasPaid: false,
    invitedAt: new Date('2025-01-01'),
  });

  describe('Before deadline (estimated price)', () => {
    it('should calculate price with all invited members (pending + accepted)', () => {
      const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const group = { ...baseGroup, memberDeadline: futureDeadline };
      
      const members = [
        createMember('creator-1', 'accepted'),
        createMember('user-2', 'accepted'),
        createMember('user-3', 'pending'),
        createMember('user-4', 'pending'),
      ];

      // 300 / 4 = 75 (includes all pending + accepted)
      const result = calculatePricePerPerson(group, members);
      expect(result).toBe(75);
    });

    it('should exclude rejected members from calculation', () => {
      const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const group = { ...baseGroup, memberDeadline: futureDeadline };
      
      const members = [
        createMember('creator-1', 'accepted'),
        createMember('user-2', 'accepted'),
        createMember('user-3', 'pending'),
        createMember('user-4', 'rejected'),
      ];

      // 300 / 3 = 100 (only pending + accepted)
      const result = calculatePricePerPerson(group, members);
      expect(result).toBe(100);
    });

    it('should return total price if no invited members', () => {
      const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const group = { ...baseGroup, memberDeadline: futureDeadline };
      
      const members: GroupMember[] = [];

      const result = calculatePricePerPerson(group, members);
      expect(result).toBe(300);
    });
  });

  describe('After deadline (final price)', () => {
    it('should calculate price with only accepted members', () => {
      const pastDeadline = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const group = { ...baseGroup, memberDeadline: pastDeadline };
      
      const members = [
        createMember('creator-1', 'accepted'),
        createMember('user-2', 'accepted'),
        createMember('user-3', 'pending'),
        createMember('user-4', 'pending'),
      ];

      // 300 / 2 = 150 (only accepted members)
      const result = calculatePricePerPerson(group, members);
      expect(result).toBe(150);
    });

    it('should return total price if no accepted members', () => {
      const pastDeadline = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const group = { ...baseGroup, memberDeadline: pastDeadline };
      
      const members = [
        createMember('user-1', 'pending'),
        createMember('user-2', 'rejected'),
      ];

      const result = calculatePricePerPerson(group, members);
      expect(result).toBe(300);
    });
  });

  describe('No deadline set', () => {
    it('should calculate with all invited members when no deadline', () => {
      const group = { ...baseGroup, memberDeadline: undefined };
      
      const members = [
        createMember('creator-1', 'accepted'),
        createMember('user-2', 'accepted'),
        createMember('user-3', 'pending'),
      ];

      // 300 / 3 = 100
      const result = calculatePricePerPerson(group, members);
      expect(result).toBe(100);
    });
  });
});

describe('Group Calculations - Deadline Validation', () => {
  describe('isDeadlinePassed', () => {
    it('should return false if no deadline is set', () => {
      expect(isDeadlinePassed(undefined)).toBe(false);
    });

    it('should return true if deadline is in the past', () => {
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(isDeadlinePassed(pastDate)).toBe(true);
    });

    it('should return false if deadline is in the future', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(isDeadlinePassed(futureDate)).toBe(false);
    });
  });

  describe('canInviteMembers', () => {
    it('should allow inviting when no deadline is set', () => {
      expect(canInviteMembers(undefined)).toBe(true);
    });

    it('should allow inviting before deadline', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(canInviteMembers(futureDate)).toBe(true);
    });

    it('should prevent inviting after deadline', () => {
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(canInviteMembers(pastDate)).toBe(false);
    });
  });

  describe('canAcceptInvitation', () => {
    it('should allow accepting when no deadline is set', () => {
      expect(canAcceptInvitation(undefined)).toBe(true);
    });

    it('should allow accepting before deadline', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(canAcceptInvitation(futureDate)).toBe(true);
    });

    it('should prevent accepting after deadline', () => {
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(canAcceptInvitation(pastDate)).toBe(false);
    });
  });
});
