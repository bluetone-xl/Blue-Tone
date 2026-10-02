function normalizeUid(uid) {
  if (uid === null || uid === undefined || uid === '') {
    return null;
  }

  return String(uid);
}

function resolveUid({ senderUid, mentionedUid = null, repliedUserUid = null } = {}) {
  const targetUid =
    normalizeUid(mentionedUid) ||
    normalizeUid(repliedUserUid) ||
    normalizeUid(senderUid);

  return targetUid;
}

module.exports = {
  normalizeUid,
  resolveUid
};
