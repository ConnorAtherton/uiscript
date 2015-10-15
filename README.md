# uiscript

A human-readable web ui manipulation language.

## Syntax

### Multi-rule set

```
// A comment
//
// The @ syntax is a named sequence
@logged_in_animation
when a user 'clicks on' '.selector' then
  // will throw on compilation if no trigger with that
  // is found
  trigger 'clicked_on'
  add 'erer' to 'sdsdsd'
end
```

### Triggers

```
// run a trigger using the run keyword
when 'clicked_on' is triggered then
  // run a named sequence
  run logged_in_animation
end
```

### Supported events

This is an initial list that will be expanded on
in future releases.

- clicks on
- doubleclicks on
- hovers on
- mouses up
- mouses down
- mouses over


