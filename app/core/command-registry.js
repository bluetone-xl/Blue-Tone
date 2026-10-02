export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(command) {
    if (!command?.name) return false;
    this.commands.set(command.name, command);
    return true;
  }

  get(name) {
    return this.commands.get(name);
  }
}

export default CommandRegistry;
