import GroupEventHandler from '../../events/group-events.js';

export class ExtensionEventHandler {
  constructor(runtime) {
    this.runtime = runtime;
    this.groupEvents = new GroupEventHandler();
  }

  async handle(event) {
    if (!event || !event.type) return null;

    switch (event.type) {
      case 'message':
        return await this.runtime.eventRouter.processIncomingMessage(event.data);

      case 'event:join':
        return await this.groupEvents.handleMemberJoin(event.data);

      case 'event:leave':
        return await this.groupEvents.handleMemberLeave(event.data);

      default:
        return null;
    }
  }
}

export default ExtensionEventHandler;
