export function createMessageContext(input = {}, prefix = '!') {
  const body = input.body || '';
  const isCommand = body.startsWith(prefix);
  const commandName = isCommand ? body.slice(prefix.length).split(' ')[0] : null;

  return {
    isCommand,
    context: {
      ...input,
      prefix,
      commandName,
      args: isCommand ? body.slice(prefix.length).split(' ').slice(1) : []
    }
  };
}

export default { createMessageContext };
