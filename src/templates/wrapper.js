(function(root) {
  var $ = document.querySelectorAll

  root.ui = {
    events: {
      addEvent(nodeList, evt, fn) {
        Array.from(nodeList).forEach(elem => {
          elem.addEventListener(evt, fn, false)
        })
      },

      removeEvent(nodeList, evt, fn) {
        Array.from(nodeList).forEach(elem => {
          elem.removeEventListener(evt, fn, false)
        })
      }
    },

    dom: {
      has(elem, attr, val) {
        return elem[attr].indexOf(val) !== -1
      },

      add(elem, attr, val) {
        if (!root.ui.dom.has(elem, attr, val)) {
          elem[attr] += (elem[attr] && ' ') + val
        }
      },

      remove(elem, attr, val) {
        elem[attr] = (elem[attr]).replace(val, '')
      },

      toggle(elem, attr, val) {
        let method = root.ui.dom.has(elem, attr, val) ? 'remove' : 'add'
        root.ui.dom[method](elem, attr, val)
      }
    }
  }

// ---> uiscript

}(window))
