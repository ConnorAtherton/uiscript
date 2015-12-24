# uiscript

A web UI manipulation language for humans.

uiscript is a simple language for ma. uiscript makes the
the following assumptions:

- Animations should be declared in css using stateful classes (.is-open, .has-hovered)
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
Notice that `@element` inside the `then .. end` refers to the event
target.

```
// This is a comment
when I 'click' on '.menu_item' then
  toggle '.open' on @element
end
```

You can then animation the element using css transforms and css animations.

```css
.menu_item {

}

.menu_item.open {

}
```

The `on @element` can be omitted. uiscript will implicitly
assume any actions you take will be related to the event target (@element).

```
when I 'click' on '.menu_item' then
  toggle '.open'
end
```

### Caching variables

We can cache variables
to avoid jumping back into the DOM every time
an event fires.

This is most useful when animating static
elements that aren't dyanamically added or
removed from the DOM during the lifecycle of
the page.

```
// Caches every node with the menu_item class
@menu_item '.menu_item'
```

We can then use that cached reference in our animation
declerations.

```
// Add a click event on a cached DOM element
when I click on @menu_item then
  toggle '.open' on @element
end
```

### Sequences

[TODO]

Sequences are a linear conbination of actions.

Use sequences when:
- You want to re-use the same steps across multiple different
  events (think global actions, like updating a notification counter).
- An animation is complex and you want to extract it from the
  event declaration for clarity. As a rule of thumb, any action
  that is 10 lines or more should be split into a sequence.

```
// The @ syntax declares the sequence name
@logged_in_animation then
  add 'erer' to 'sdsdsd'
end
```

Use the `run` keyword to start a sequence.

```
// run a trigger using the run keyword
when I 'click' on @menu_item then
  // run a named sequence
  // NOTE: will throw an error if no sequence exists with the name
  run logged_in_animation
end
```

### Supported events

This is an initial list that will be expanded
in future releases.

- clicks on
- doubleclicks on
- hovers on
- mouses up
- mouses down
- mouses over

