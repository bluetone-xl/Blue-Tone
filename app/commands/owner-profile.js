import { isBotOwner } from '../core/auth.js';
import fbAccount from '../integrations/meta/facebook-account.js';
import { LogQuery } from '../database/queries.js';

export default function registerOwnerProfileCommands(runtime) {
  // 1. Set Bio Command
  runtime.registerCommand({
    name: 'setbio',
    execute: async (ctx) => {
      if (!isBotOwner(ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Bot Owner can use this command.' };
      }

      const bioText = ctx.args.join(' ');
      if (!bioText) return { text: `⚠️ Usage: ${ctx.prefix}setbio <your_new_bio>` };

      await fbAccount.updateBio(bioText);
      await LogQuery.add(ctx.senderId, ctx.groupId, 'setbio', 'SUCCESS');
      return { text: `✅ Facebook bio update queued:\n"${bioText}"` };
    }
  });

  // 2. Smart Post Command
  runtime.registerCommand({
    name: 'post',
    execute: async (ctx) => {
      if (!isBotOwner(ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Bot Owner can use this command.' };
      }

      const repliedImage = ctx.quotedMessage?.attachments?.[0]?.url || ctx.quotedMessage?.imageUrl;
      const captionOrText = ctx.args.join(' ');

      if (repliedImage) {
        await fbAccount.createImagePost(repliedImage, captionOrText);
        await LogQuery.add(ctx.senderId, ctx.groupId, 'post_image', 'SUCCESS');

        return {
          text: `📸 Image post queued for Bot Account!\n• Image: ${repliedImage}\n• Caption: ${captionOrText || '(No caption)'}`
        };
      }

      if (!captionOrText) {
        return { text: `⚠️ Usage:\n1. Reply to an image with ${ctx.prefix}post [optional caption]\n2. Type ${ctx.prefix}post <text> for text-only post.` };
      }

      await fbAccount.createTextPost(captionOrText);
      await LogQuery.add(ctx.senderId, ctx.groupId, 'post_text', 'SUCCESS');

      return { text: `📝 Text post queued for Bot Account!\n\nContent:\n"${captionOrText}"` };
    }
  });

  // 3. Smart Set Profile Picture
  runtime.registerCommand({
    name: 'setpfp',
    execute: async (ctx) => {
      if (!isBotOwner(ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Bot Owner can use this command.' };
      }

      const imageUrl = ctx.quotedMessage?.attachments?.[0]?.url || ctx.quotedMessage?.imageUrl || ctx.args[0];
      const caption = ctx.quotedMessage ? ctx.args.join(' ') : ctx.args.slice(1).join(' ');

      if (!imageUrl) {
        return { text: `⚠️ Usage: Reply to an image with ${ctx.prefix}setpfp [optional caption] OR pass image URL.` };
      }

      await fbAccount.updateProfilePicture(imageUrl, caption);
      await LogQuery.add(ctx.senderId, ctx.groupId, 'setpfp', 'SUCCESS');
      
      return { 
        text: `🖼️ Profile picture update queued for Bot Account!\n• Image: ${imageUrl}\n• Caption: ${caption || '(No caption)'}` 
      };
    }
  });

  // 4. Smart Set Cover Photo
  runtime.registerCommand({
    name: 'setcover',
    execute: async (ctx) => {
      if (!isBotOwner(ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Bot Owner can use this command.' };
      }

      const imageUrl = ctx.quotedMessage?.attachments?.[0]?.url || ctx.quotedMessage?.imageUrl || ctx.args[0];

      if (!imageUrl) {
        return { text: `⚠️ Usage: Reply to an image with ${ctx.prefix}setcover OR pass image URL.` };
      }

      await fbAccount.updateCoverPhoto(imageUrl);
      await LogQuery.add(ctx.senderId, ctx.groupId, 'setcover', 'SUCCESS');

      return { text: `🖼️ Cover photo update queued for Bot Account!` };
    }
  });
}
