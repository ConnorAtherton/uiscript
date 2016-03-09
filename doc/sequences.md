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
  run @logged_in_animation
end
```

