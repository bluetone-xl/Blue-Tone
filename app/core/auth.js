export function isBotOwner(senderId) {
  const ownerUid = process.env.BOT_OWNER_UID || '61594424694266';
  return String(senderId) === String(ownerUid);
}

export function isGroupAdmin(senderRole, senderId) {
  if (isBotOwner(senderId)) return true;
  return senderRole === 'admin' || senderRole === 'moderator' || senderRole === 'owner';
}

export default { isBotOwner, isGroupAdmin };
