"use strict";!function(e){var n=document.querySelectorAll.bind(document);e.ui={forEachNode:function(e,n){e&&e.nodeType&&1===e.nodeType&&(e=[e]),Array.from(e).forEach(function(e){return n(e)})},events:{addEvent:function(n,o,t){e.ui.forEachNode(n,function(e){return e.addEventListener(o,t,!1)})},removeEvent:function(n,o,t){e.ui.forEachNode(n,function(e){return e.removeEventListener(o,t,!1)})}},dom:{has:function(e,n){return e.className&&e.className.indexOf(n)!==-1},add:function(n,o){e.ui.forEachNode(n,function(n){e.ui.dom.has(n,o)||(n.className+=(n.className&&" ")+o)})},remove:function(n,o){e.ui.forEachNode(n,function(e){e.className=e.className.replace(o,"")})},toggle:function(n,o){e.ui.forEachNode(n,function(n){var t=e.ui.dom.has(n,o)?"remove":"add";e.ui.dom[t](n,o)})}}};var o=n("button");!function(){e.ui.events.addEvent(o,"click",function(n){e.ui.dom.toggle(n.currentTarget,"is-active")})}()}(window);