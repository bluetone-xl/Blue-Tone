/**
 * CommandDispatcher routes incoming command contexts to their respective command handlers.
 */
export class CommandDispatcher {
  /**
   * @param {Object} params
   * @param {Object} params.registry - Instance of CommandRegistry
   * @param {Function} [params.getGroupAdmins] - Optional helper to fetch group admins
   */
  constructor({ registry, getGroupAdmins = null } = {}) {
    this.registry = registry;
    this.getGroupAdmins = getGroupAdmins;
  }

  /**
   * Dispatches the command safely within an error boundary.
   * @param {Object} context - Standardized command context object
   * @returns {Promise<Object>} Execution result or error response
   */
  async dispatch(context) {
    try {
      if (!context || typeof context !== 'object') {
        return { handled: false, reason: 'INVALID_CONTEXT' };
      }

      const commandName = String(context.commandName || context.command || '').trim().toLowerCase();
      if (!commandName) {
        return { handled: false, reason: 'EMPTY_COMMAND_NAME' };
      }

      if (!this.registry || typeof this.registry.get !== 'function') {
        console.error('❌ [CommandDispatcher] Command registry is missing or invalid.');
        return { handled: false, reason: 'REGISTRY_UNAVAILABLE' };
      }

      const command = this.registry.get(commandName);
      if (!command) {
        return { handled: false, reason: 'COMMAND_NOT_FOUND' };
      }

      if (typeof command.execute !== 'function') {
        console.error(`❌ [CommandDispatcher] Command "${commandName}" missing executable handler.`);
        return { handled: false, reason: 'COMMAND_NOT_EXECUTABLE' };
      }

      // Safely execute the command
      const result = await command.execute(context);
      return { handled: true, result };
    } catch (err) {
      console.error('❌ [CommandDispatcher] Unhandled execution error:', err);
      return {
        handled: false,
        reason: 'EXECUTION_ERROR',
        error: err.message
      };
    }
  }
}

export default CommandDispatcher;
