export default class TriggerNode {
  constructor(triggerValue, selector, receiver) {
    this.triggerValue = triggerValue
    this.selector = selector
    this.receiver = receiver
  }

  toString() {
    return `    root.ui.dom['${this.triggerValue}'](${this.receiver}, '${this.selector}')`
  }
}
