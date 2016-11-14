# uiscript ![Build Status](https://api.travis-ci.org/ConnorAtherton/uiscript.svg)

A web UI manipulation language for humans.

uiscript is a simple language that compiles to JavaScript that allows you to create
complex user interface behaviours in an understandable way. To do this, it follows these
principles of how this kind of animation should be built using web technologies:

- Animation states should be declared in CSS using stateful classes (.is-open, .has-hovered).
- Event management and DOM attributes management should be handled by JavaScript.

## Installing

Install it globally through npm.

```
npm install -g uiscript
```

__TODO__ This can't be run in a browser, yet.

## Running

A uiscript file should have the file extension `.ui`

```
uiscript example.ui
```

## Syntax

The full grammar is available in `doc/grammar.txt`.

Here is a simple example to toggle the `is-active` class on any node matching the selector
`.Menu__trigger` when clicked.

```
// Single line syntax. Notice the terminating period (.).
when I "click" on ".Menu__trigger" then toggle "is-active".
```

Following the second principle above, we allow JavaScript to handle the event logic and we change
the visual presentation of the element by leveraging CSS. Here I am using a state class combined
with a CSS transition.

```css
.Menu__Trigger {
  border: 1px solid gray;
}

.Menu__trigger ~ .Menu__body {
  opacity: 0;
  transition: opacity 200ms linear;
}

.Menu__trigger.is-active {
  border: 1px solid blue;
}

.Menu__trigger.is-active ~ .Menu__body {
  opacity: 1;
}
```

### Delegation

Interactions can trigger multiple different events. For example, let's say we want to expand an
information section when we click a button and also show that the button has been clicked. We can
make this work using the `on` keyword inside the declaration block.

```
when I "click" on ".Button--cta" then
  // [trigger] [classSelector] on [element]
  add "is-expanded" on ".Information-section"
  add "Button--active"
end
```

The element can be a string selector or a cached variable (see below).

In the above examples, the `on <element>` can be omitted and uiscript will implicitly
assume any actions you take will be related to the event target.

### Caching variables

We can cache variables to avoid querying the DOM for targetevery time an event fires.

This is most useful when animating static elements that aren't dyanamically added or removed from
the DOM during the lifecycle of the page.

We declare a variable using an assignment syntax that you are likely familiar with from
other popular languages: the left hand side is the variable name, followed by an `=`
operator and the only valid value is a string to be matched against the DOM.

```
@variableElement = ".Message"

when I "dblclick" on "button" then
  toggle "is-visible" on @variableElement
end
```

### Scopes

Opening a new block using the `then` keyword will create a new variable scope within the block.

```
// Caches every anchor node
@links = "a"

// Add an event on a cached DOM element
when I "dblclick" on @links then
  @links = "a.special" // fetch all active links

  // a.special is the target
  toggle "is-clicked" on @links
end
```

### Supported events

This is an initial list that will be expanded in future releases. I'm hoping to add support
for other events fired by the browser that aren't initiated by an explicit user interaction, e.g.
`DOMContentReady`.

- `click`
- `doubleclick`
- `mouseup`
- `mousedown`
- `mouseover`

### Transforms

You can also pass optional cli arguments to `uiscript` that will transform the output.

```
-m, --minify   Minify all js output
```

### Contributing

Pull requests and issue submissions are encouraged. I've added some example tasks in the `TODO.md`
but feel free to work on anything that interests you.

