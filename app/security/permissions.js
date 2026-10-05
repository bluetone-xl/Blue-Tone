import Logger from '../core/logger.js';

class Permissions {
  constructor() {
    this.ownerUid = process.env.BOT_OWNER_UID || '61570788647563';
    this.managementGroupId = process.env.MANAGEMENT_GROUP_ID || null;

    // In-memory data store for roles
    this.vipPermissions = new Map(); // Map<userID, Set<commandName>>
    this.groupExperts = new Map();   // Map<threadID, Set<userID>>
  }

  getOwnerUid() {
    return String(this.ownerUid);
  }

  isOwner(senderID) {
    return String(senderID) === String(this.ownerUid);
  }

  isManagementGroup(threadID) {
    return String(threadID) === String(this.managementGroupId || process.env.MANAGEMENT_GROUP_ID);
  }

  async isGroupAdmin(api, threadID, userID) {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      if (!threadInfo || !threadInfo.adminIDs) return false;
      return threadInfo.adminIDs.some(admin => String(admin.id) === String(userID));
    } catch (error) {
      if (Logger && Logger.error) {
        Logger.error('PERMISSIONS', `Admin check failed for ${userID} in ${threadID}:`, error.message);
      }
      return false;
    }
  }

  isGroupExpert(threadID, userID) {
    const threadExperts = this.groupExperts.get(String(threadID));
    return threadExperts ? threadExperts.has(String(userID)) : false;
  }

  setGroupExpert(threadID, userID, promote = true) {
    const tId = String(threadID);
    const uId = String(userID);

    if (!this.groupExperts.has(tId)) {
      this.groupExperts.set(tId, new Set());
    }

    const expertSet = this.groupExperts.get(tId);
    if (promote) {
      expertSet.add(uId);
    } else {
      expertSet.delete(uId);
    }
  }

  getGroupExperts(threadID) {
    const threadExperts = this.groupExperts.get(String(threadID));
    return threadExperts ? Array.from(threadExperts) : [];
  }

  hasVipPermission(userID, commandName) {
    const allowedCmds = this.vipPermissions.get(String(userID));
    if (!allowedCmds) return false;
    return allowedCmds.has('all') || allowedCmds.has(commandName.toLowerCase());
  }

  setVipPermissions(userID, commandList) {
    const uId = String(userID);
    const cmdSet = new Set(commandList.map(cmd => cmd.toLowerCase()));
    this.vipPermissions.set(uId, cmdSet);
  }

  revokeVip(userID) {
    this.vipPermissions.delete(String(userID));
  }

  async canExecute(api, event, command) {
    const senderID = String(event.senderID);
    const threadID = String(event.threadID);
    const category = command.category ? command.category.toLowerCase() : 'general';

    // 1. Owner is unrestricted everywhere
    if (this.isOwner(senderID)) {
      return { allowed: true, role: 'owner' };
    }

    // 2. Owner-only categories
    const ownerOnlyCategories = ['owner', 'account', 'system'];
    if (ownerOnlyCategories.includes(category) || command.ownerOnly) {
      return { allowed: false, reason: '⚠️ Access Restricted: Bot Owner Only.' };
    }

    // 3. VIP Check
    if (this.hasVipPermission(senderID, command.name)) {
      return { allowed: true, role: 'vip' };
    }

    // 4. Group Expert Check (Settings commands)
    if (category === 'settings' || command.expertAllowed) {
      if (this.isGroupExpert(threadID, senderID)) {
        return { allowed: true, role: 'expert' };
      }
    }

    // 5. Group Admin Check
    if (category === 'admin' || category === 'group' || command.adminOnly) {
      const isAdmin = await this.isGroupAdmin(api, threadID, senderID);
      if (isAdmin) {
        return { allowed: true, role: 'admin' };
      }
      return { allowed: false, reason: '⚠️ Access Denied: Group Admins or Owner Only.' };
    }

    // 6. Public Commands
    return { allowed: true, role: 'member' };
  }
}

export default new Permissions();
