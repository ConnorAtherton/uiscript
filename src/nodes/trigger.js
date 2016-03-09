export default class TriggerNode {
  // @param [String] triggerType
  //   Holds what event should happen once this trigger is invoked
  // @param [String] selector
  //   The selector passed to the trigger
  // @param [ReceiverNode] receiver
  //   The element that receives the trigger
  constructor(triggerType, selector, receiver) {
    this.triggerType = triggerType
    this.selector = selector
    this.receiver = receiver
  }

  toString() {
    return `    root.ui.dom['${this.triggerType}'](${this.receiver.toString()}, '${this.selector}')`
  }
}
