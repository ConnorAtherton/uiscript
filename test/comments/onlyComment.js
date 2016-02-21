'use strict';

(function (root) {
  var $ = document.querySelectorAll;

  root.ui = {
    events: {
      addEvent: function addEvent(nodeList, evt, fn) {
        Array.from(nodeList).forEach(function (elem) {
          elem.addEventListener(evt, fn, false);
        });
      },
      removeEvent: function removeEvent(nodeList, evt, fn) {
        Array.from(nodeList).forEach(function (elem) {
          elem.removeEventListener(evt, fn, false);
        });
      }
    },

    dom: {
      has: function has(elem, attr, val) {
        return elem[attr].indexOf(val) !== -1;
      },
      add: function add(elem, attr, val) {
        if (!root.ui.dom.has(elem, attr, val)) {
          elem[attr] += (elem[attr] && ' ') + val;
        }
      },
      remove: function remove(elem, attr, val) {
        elem[attr] = elem[attr].replace(val, '');
      },
      toggle: function toggle(elem, attr, val) {
        var method = root.ui.dom.has(elem, attr, val) ? 'remove' : 'add';
        root.ui.dom[method](elem, attr, val);
      }
    }
  };

  var $first = $('string')
  var $camelCase = $('test')
  
  (function() {
    var $__selector__ = $('.div > text')
    root.ui.events.addEvent($__selector__, 'click', function(e) {
      root.ui.dom['add']($('.selector'), 'class', 'body')
      root.ui.dom['toggle']($('.outer-scope'), 'class', 'string')
      root.ui.dom['remove']($('.inner-scope'), 'class', '.scopeTest')
      root.ui.dom['add']($('.implicit'), 'class', '.div > text')
    })
  })()
  
})(window);
