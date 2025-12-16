import { GiftGroup, GroupMember } from '../context/GroupsContext';

/**
 * Calculate price per person for a gift group
 * - Before deadline: estimated price (includes pending + accepted members)
 * - After deadline: final price (only accepted members)
 */
export function calculatePricePerPerson(
  group: GiftGroup,
  members: GroupMember[]
): number {
  const deadlinePassed = group.memberDeadline ? new Date() > group.memberDeadline : false;

  if (deadlinePassed) {
    // Final price: only accepted members
    const acceptedMembers = members.filter(m => m.status === 'accepted');
    if (acceptedMembers.length === 0) return group.totalPrice;
    return group.totalPrice / acceptedMembers.length;
  }

  // Estimated price: all invited members (pending + accepted)
  const invitedMembers = members.filter(m => m.status === 'pending' || m.status === 'accepted');
  if (invitedMembers.length === 0) return group.totalPrice;
  return group.totalPrice / invitedMembers.length;
}

/**
 * Check if a deadline has passed
 */
export function isDeadlinePassed(deadline: Date | undefined): boolean {
  if (!deadline) return false;
  return new Date() > deadline;
}

/**
 * Validate if new members can be invited based on deadline
 */
export function canInviteMembers(memberDeadline: Date | undefined): boolean {
  return !isDeadlinePassed(memberDeadline);
}

/**
 * Validate if an invitation can be accepted based on deadline
 */
export function canAcceptInvitation(memberDeadline: Date | undefined): boolean {
  return !isDeadlinePassed(memberDeadline);
}
