(function(root) {
  root.uiUtils = {
    events: {
      addEvent(elem, evt, fn) {
        return elem.addEventListener(evt, fn, false)
      },

      removeEvent(elem, evt, fn) {
        return elem.removeEventListener(evt, fn, false)
      }
    },

    dom: {
      has(elem, attr, val) {
        return elem[attr].indexOf(val) !== -1
      },

      add(elem, attr, val) {
        if (!root.uiUtils.klass.has(elem, attr, val)) {
          elem[attr] += (elem[attr] && ' ') + val
        }
      },

      remove(elem, attr, val) {
        elem[attr] = (elem[attr]).replace(val, '')
      },

      toggle(elem, attr, val) {
        let method = root.uiUtils.dom.has(elem, attr, val) ? 'remove' : 'add'
        root.uiUtils[method](elem, attr, val)
      }
    }
  }

// ---> uiscript

}(window))
