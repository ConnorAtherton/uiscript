export default class BlockNode {
  constructor(action, selector) {
    this.action = action
    this.selector = selector
    this.triggers = []
  }

  toString() {
    const body = this.triggers.map(t => t.toString()).join('\n')

    return `\n(function() {
  var $__selector__ = document.querySelectorAll('${this.selector}')
  root.ui.events.addEvent($__selector__, '${this.action}', function(e) {
${body}
  })
})()\n`
  }

  addStatement(triggerNode) {
    this.triggers.push(triggerNode)
  }
}
