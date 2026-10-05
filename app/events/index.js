import { EventRouter } from './router.js';
import { ExtensionEventNormalizer } from './extension-normalizer.js';
import { GroupEventHandler } from './group-events.js';
import { createMessageContext } from './message-pipeline.js';
import { normalizeEvent, isKnownEventType, EVENT_TYPES } from './normalizer.js';

export class EventPipeline {
  constructor(runtime = null) {
    this.router = new EventRouter();
    this.extensionNormalizer = new ExtensionEventNormalizer();
    this.groupEventHandler = new GroupEventHandler();

    if (runtime) {
      this.router.setRuntime(runtime);
    }
  }

  setRuntime(runtime) {
    this.router.setRuntime(runtime);
  }

  /**
   * Main entry point to dispatch any incoming raw event.
   * @param {Object} rawEvent 
   * @returns {Promise<Object>}
   */
  async handleEvent(rawEvent) {
    try {
      if (!rawEvent || typeof rawEvent !== 'object') {
        return { status: 'IGNORED_INVALID_EVENT' };
      }

      // Check if event is from external extension
      if (rawEvent.source === 'extension' || rawEvent.event) {
        const normalizedExt = this.extensionNormalizer.normalize(rawEvent);
        if (!normalizedExt) return { status: 'INVALID_EXTENSION_EVENT' };
        return await this.router.processIncomingMessage(normalizedExt);
      }

      // Standard message/event normalization
      const normalized = normalizeEvent(rawEvent);

      if (normalized.type === EVENT_TYPES.MESSAGE) {
        const { context } = createMessageContext(normalized);
        return await this.router.processIncomingMessage(context);
      }

      if (normalized.type === EVENT_TYPES.MEMBER_JOIN) {
        return await this.groupEventHandler.handleMemberJoin(normalized);
      }

      if (normalized.type === EVENT_TYPES.MEMBER_LEAVE || normalized.type === EVENT_TYPES.MEMBER_REMOVE) {
        return await this.groupEventHandler.handleMemberLeave(normalized);
      }

      return { status: 'UNHANDLED_EVENT_TYPE', type: normalized.type };
    } catch (err) {
      console.error('❌ [EventPipeline] Error dispatching event:', err.message);
      return { status: 'ERROR', error: err.message };
    }
  }
}

export {
  EventRouter,
  ExtensionEventNormalizer,
  GroupEventHandler,
  createMessageContext,
  normalizeEvent,
  isKnownEventType,
  EVENT_TYPES
};

export default EventPipeline;
