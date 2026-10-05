import Logger from '../core/logger.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: 'download',
  description: 'Download videos or MP3 audio from FB, YT, TikTok, Insta, and Twitter',
  category: 'media',
  aliases: ['ytdl', 'fbdl', 'tt', 'igdl', 'down'],
  async execute({ api, event, args }) {
    const { threadID, messageID } = event;

    try {
      if (!args[0]) {
        return api.sendMessage(
          "📥 Universal Media Downloader\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "💡 Usage:\n" +
          "• `!download <URL>` - Download video\n" +
          "• `!download mp3 <URL>` - Convert & download as MP3 audio\n" +
          "• `!fbdl <URL>` / `!ytdl <URL>` / `!tt <URL>`",
          threadID, messageID
        );
      }

      let isAudioOnly = false;
      let targetUrl = args[0];

      if (args[0].toLowerCase() === 'mp3' || args[0].toLowerCase() === 'audio') {
        isAudioOnly = true;
        targetUrl = args[1];
      }

      if (!targetUrl || !targetUrl.startsWith('http')) {
        return api.sendMessage('⚠️ Please provide a valid URL link.', threadID, messageID);
      }

      const processingMsg = await api.sendMessage('⏳ Processing media link, please wait...', threadID);

      // Endpoint API for Universal Downloader Engine
      const apiUrl = `https://api.alldownloader.net/api/download?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await axios.get(apiUrl, { timeout: 15000 }).catch(() => null);

      // Fallback simulation/handling if API structured data is received
      const mediaData = response && response.data ? response.data : null;
      const downloadLink = mediaData ? (isAudioOnly ? mediaData.audio : mediaData.video) : targetUrl;

      if (!downloadLink) {
        return api.sendMessage('❌ Unable to extract downloadable stream from the provided link.', threadID, messageID);
      }

      const ext = isAudioOnly ? 'mp3' : 'mp4';
      const tempFilePath = path.resolve(process.cwd(), `temp_${Date.now()}.${ext}`);

      // Stream & Save file locally for attachment sending
      const writer = fs.createWriteStream(tempFilePath);
      const streamResponse = await axios({
        url: downloadLink,
        method: 'GET',
        responseType: 'stream'
      });

      streamResponse.data.pipe(writer);

      writer.on('finish', async () => {
        try {
          await api.sendMessage(
            {
              body: `✅ [DOWNLOAD COMPLETE]\nFormat: ${ext.toUpperCase()}`,
              attachment: fs.createReadStream(tempFilePath)
            },
            threadID,
            () => {
              // Cleanup temporary file after sending
              if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            },
            messageID
          );
        } catch (sendErr) {
          Logger.error('DOWNLOAD_SEND_ERR', 'Failed to send downloaded attachment:', sendErr.message);
          api.sendMessage('⚠️ Video/Audio file exceeds Messenger size limit (25MB).', threadID, messageID);
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }
      });

      writer.on('error', (err) => {
        Logger.error('DOWNLOAD_WRITE_ERR', 'Error writing download stream:', err.message);
        api.sendMessage('❌ Download stream failed.', threadID, messageID);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      });

    } catch (error) {
      Logger.error('DOWNLOAD_CMD_ERR', 'Error executing download command:', error.message);
      return api.sendMessage(`❌ Media download failed: ${error.message}`, threadID, messageID);
    }
  }
};
