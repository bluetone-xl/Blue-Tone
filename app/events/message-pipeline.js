/**
 * Processes incoming message payload and builds a structured message execution context.
 * @param {Object} [input={}] - Raw message object
 * @param {string} [prefix='!'] - Command prefix
 * @returns {Object} { isCommand: boolean, context: Object }
 */
export function createMessageContext(input = {}, prefix = '!') {
  try {
    const safeInput = typeof input === 'object' && input !== null ? input : {};
    const safePrefix = String(prefix || '!').trim();

    const rawBody = typeof safeInput.body === 'string' 
      ? safeInput.body.trim() 
      : String(safeInput.body || '').trim();

    const isCommand = safePrefix ? rawBody.startsWith(safePrefix) : false;

    let commandName = null;
    let args = [];

    if (isCommand) {
      // Remove prefix and split by one or more whitespace characters
      const cleanContent = rawBody.slice(safePrefix.length).trim();
      const parts = cleanContent.split(/\s+/);
      
      commandName = parts[0] ? parts[0].toLowerCase() : null;
      args = parts.slice(1);
    }

    return {
      isCommand,
      context: {
        ...safeInput,
        prefix: safePrefix,
        commandName,
        args
      }
    };
  } catch (err) {
    console.error('❌ [MessagePipeline] Error creating message context:', err.message);
    return {
      isCommand: false,
      context: {
        ...(typeof input === 'object' && input !== null ? input : {}),
        prefix: String(prefix || '!'),
        commandName: null,
        args: []
      }
    };
  }
}

export default { createMessageContext };
