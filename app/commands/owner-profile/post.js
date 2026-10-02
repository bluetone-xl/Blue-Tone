import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'post',
  description: 'Post an update with an optional quoted image',
  async execute(ctx) {
    if (!isBotOwner(ctx.senderId)) {
      return { text: '❌ Unauthorized: Only the owner can use this command.' };
    }

    const caption = ctx.args.join(' ');
    const imageUrl = ctx.quotedMessage?.imageUrl;

    if (!caption && !imageUrl) {
      return { text: '⚠️ Please provide text or reply to an image to post.' };
    }

    let response = `✅ Post Created Successfully!`;
    if (caption) response += `\nCaption: ${caption}`;
    if (imageUrl) response += `\nAttached Image: ${imageUrl}`;

    return { text: response };
  }
};
