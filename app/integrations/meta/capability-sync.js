export class CapabilitySync {
  constructor({ adapter, registry }) {
    this.adapter = adapter;
    this.registry = registry;
  }

  async sync() {
    if (!this.adapter) return false;
    return true;
  }
}

export default CapabilitySync;
