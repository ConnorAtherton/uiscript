export default class BlockNode {
  // @param [String] action
  // @param [TargetNode] target
  constructor(action, target) {
    this.action = action
    this.target = target
    this.triggers = []
    this.scope = null
  }

  requireNewTarget() {
    return this.target.type === 'selector'
  }

  toString() {
    let scopeVariables = ''

    for (let key of Object.keys(this.scope)) {
      scopeVariables += `  var $${key} = query('${this.scope[key]}')\n`
    }

    const body = this.triggers.map(t => t.toString()).join('\n')
    const newTarget = `  var $__target__ = query('${this.target.value}')`
    const eventTarget = this.requireNewTarget() ? '$__target__' : `$${this.target.value}`

    return `\n;(function() {
${this.requireNewTarget() ? newTarget : ''}
${scopeVariables}
  root.ui.events.addEvent(${eventTarget}, '${this.action}', function(e) {
${body}
  })
})()\n`
  }

  addStatement(triggerNode) {
    this.triggers.push(triggerNode)
  }
}
