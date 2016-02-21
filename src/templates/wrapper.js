(function(root) {
  var query = document.querySelectorAll

  root.ui = {
    forEachNode: function(nodeList, cb) {
      // convert it to an array if it isn't already
      if (nodeList.nodeType && nodeList.nodeType === 1) {
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
        console.log('adding a class node list')
        root.ui.forEachNode(nodeList, function(elem) {
          console.log('adding a class', elem, val)

          if (!root.ui.dom.has(elem, val)) {
            console.log('does not have the class', elem, val)
            elem.className += (elem.className && ' ') + val
          }
        })
      },

      remove(nodeList, val) {
        root.ui.forEachNode(nodeList, function(elem) {
          console.log('removing a class', val)

          elem.className = (elem.className).replace(val, '')
        })
      },

      toggle(nodeList, val) {
        root.ui.forEachNode(nodeList, function(elem) {
          let method = root.ui.dom.has(elem, val) ? 'remove' : 'add'
          root.ui.dom[method](elem, val)

          console.log('toggling a class', elem.toString(), elem.className, method, val)
        })
      }
    }
  }

// ---> uiscript

}(window))
