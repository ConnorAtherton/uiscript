;(function(root) {
  let query = document.querySelectorAll.bind(document)

  root.ui = {
    forEachNode: function(nodeList, cb) {
      if (nodeList && nodeList.nodeType && nodeList.nodeType === 1) {
        nodeList = [nodeList]
      }

      Array.from(nodeList).forEach(elem => cb(elem))
    },

    events: {
      addEvent(nodeList, evt, fn) {
        root.ui.forEachNode(nodeList, function(elem) {
          elem.addEventListener(evt, fn, false)
        })
      },

      removeEvent(nodeList, evt, fn) {
        root.ui.forEachNode(nodeList, function(elem) {
          elem.removeEventListener(evt, fn, false)
        })
      }
    },

    dom: {
      has(elem, val) {
        return elem.className && elem.className.indexOf(val) !== -1
      },

      add(nodeList, val) {
        root.ui.forEachNode(nodeList, function(elem) {
          if (!root.ui.dom.has(elem, val)) {
            elem.className += (elem.className && ' ') + val
          }
        })
      },

      remove(nodeList, val) {
        root.ui.forEachNode(nodeList, function(elem) {
          elem.className = (elem.className).replace(val, '')
        })
      },

      toggle(nodeList, val) {
        root.ui.forEachNode(nodeList, function(elem) {
          let method = root.ui.dom.has(elem, val) ? 'remove' : 'add'
          root.ui.dom[method](elem, val)
        })
      }
    }
  }

// ---> uiscript

}(window))
