export class CommandDispatcher {
  constructor({ registry, getGroupAdmins }) {
    this.registry = registry;
    this.getGroupAdmins = getGroupAdmins;
  }

  async dispatch(context) {
    const command = this.registry.get(context.commandName);
    if (!command) {
      return { handled: false, reason: 'COMMAND_NOT_FOUND' };
    }
    return command.execute(context);
  }
}

export default CommandDispatcher;
