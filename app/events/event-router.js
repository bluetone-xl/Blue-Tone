import { Logger } from '../core/logger.js';
import { commandLoader } from '../commands/index.js';

/**
 * Event Router to bridge incoming events from EventListener to CommandLoader.
 */
export class EventRouter {
  /**
   * Processes incoming text message events and routes to CommandLoader.
   */
  async processMessage(event, api) {
    if (!event || !event.body) return;

    try {
      await commandLoader.handleMessage(event, api);
    } catch (err) {
      Logger.error('EVENT_ROUTER', 'Error processing message event:', err?.message || err);
    }
  }

  /**
   * Handles incoming reaction events.
   */
  async processReaction(event, api) {
    if (!event) return;
    Logger.debug('EVENT_ROUTER', `Reaction received from ${event.senderId}: ${event.reaction}`);
  }
}

export const eventRouter = new EventRouter();
export default eventRouter;
