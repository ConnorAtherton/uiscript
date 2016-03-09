# uiscript ![Build Status](https://api.travis-ci.org/ConnorAtherton/uiscript.svg)

A web UI manipulation language for humans.

uiscript makes the the following assumptions:

- Animations should be declared in CSS using stateful classes (.is-open, .has-hovered)
- Event management should be handled by JavaScript (adding event handlers and managing DOM attributes)

## Installing

Install it globally through npm.

```
npm install -g uiscript
```

## Running

A uiscript file should have the file extension `.ui`

```
uiscript home_page.ui home_page.js
```

It also accepts globs

```
uiscript animations/**/* js/animations
```

Use the `-w` option to watch the file and automatically regenerate the
JavaScript files everytime something changes.

```
uiscript -w animations/**/* js/animations
```

Pass the `-m` option to minify the output and change the file name to
end with `.min.js`.

```
uiscript -m animations/**/* js/animations
```

Run `uiscript` to see all possible options.

## Syntax

A simple example to add a class on the element when it is clicked on.
The `@element` inside the `then .. end` refers to the event
target.

```
// This is a comment
when I 'click' on '.menu_item' then
  toggle '.is-open' on @element
end
```

You can then let css animate the element using css transforms and css animations.

```css
.menu_item {
  opacity: 0;
  transition: opacity 200ms linear;
}

.menu_item.is-open {
  opacity: 1;
}
```

The `on @element` can be omitted and uiscript will implicitly
assume any actions you take will be related to the event target (@element).

```
when I 'click' on '.menu_item' then
  toggle '.is-open'
end
```

### Caching variables

We can cache variables to avoid jumping back into the DOM every time
an event fires.

This is most useful when animating static
elements that aren't dyanamically added or
removed from the DOM during the lifecycle of
the page.

```
// Caches every node with the menu_item class
@menuItem = '.menu_item'
```

We can then use that cached reference in our animation
declarations.

```
// Add a click event on a cached DOM element
when I 'click' on @menuItem then
  toggle '.is-open'
end
```

### Supported events

This is an initial list that will be expanded
in future releases.

- click
- doubleclick
- hover
- mouseup
- mousedown
- mouseover

