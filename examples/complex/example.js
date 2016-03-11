'use strict';

;(function (root) {
  /* eslint-disable no-unused-vars */
  var query = document.querySelectorAll.bind(document);
  /* eslint-enable no-unused-vars */

  root.ui = {
    forEachNode: function forEachNode(nodeList, cb) {
      if (nodeList && nodeList.nodeType && nodeList.nodeType === 1) {
        nodeList = [nodeList];
      }

      Array.from(nodeList).forEach(function (elem) {
        return cb(elem);
      });
    },

    events: {
      addEvent: function addEvent(nodeList, evt, fn) {
        root.ui.forEachNode(nodeList, function (elem) {
          return elem.addEventListener(evt, fn, false);
        });
      },
      removeEvent: function removeEvent(nodeList, evt, fn) {
        root.ui.forEachNode(nodeList, function (elem) {
          return elem.removeEventListener(evt, fn, false);
        });
      }
    },

    dom: {
      has: function has(elem, val) {
        return elem.className && elem.className.indexOf(val) !== -1;
      },
      add: function add(nodeList, val) {
        root.ui.forEachNode(nodeList, function (elem) {
          if (!root.ui.dom.has(elem, val)) {
            elem.className += (elem.className && ' ') + val;
          }
        });
      },
      remove: function remove(nodeList, val) {
        root.ui.forEachNode(nodeList, function (elem) {
          elem.className = elem.className.replace(val, '');
        });
      },
      toggle: function toggle(nodeList, val) {
        root.ui.forEachNode(nodeList, function (elem) {
          var method = root.ui.dom.has(elem, val) ? 'remove' : 'add';
          root.ui.dom[method](elem, val);
        });
      }
    }
  };

var $first = query('string')
var $camelCase = query('test')

;(function() {
  var $__target__ = query('.div > text')
  var $inBlock = query('.scopeTest')

  root.ui.events.addEvent($__target__, 'click', function(e) {
    root.ui.dom['add'](query('body'), '.selector')
    root.ui.dom['toggle']($first, '.outer-scope')
    root.ui.dom['remove']($inBlock, '.inner-scope')
    root.ui.dom['add'](e.currentTarget, '.implicit')
  })
})()

})(window);
