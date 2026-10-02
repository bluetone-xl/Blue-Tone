import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'setbio',
  description: 'Update the bot owner profile bio',
  async execute(ctx) {
    if (!isBotOwner(ctx.senderId)) {
      return { text: '❌ Unauthorized: Only the owner can use this command.' };
    }

    const bioText = ctx.args.join(' ');
    if (!bioText) {
      return { text: '⚠️ Please provide a bio text. Example: !setbio Hello World' };
    }

    return { text: `✅ Bio successfully updated to:\n"${bioText}"` };
  }
};
