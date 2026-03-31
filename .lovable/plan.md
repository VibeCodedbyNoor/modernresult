

## Plan: Move Chatbot Widget to Bottom-Left

### Change
**`index.html` (line 56)**: Change `right:0` to `left:0` in the iframe's inline style.

```html
<!-- Before -->
style="position:fixed;bottom:0;right:0;..."

<!-- After -->
style="position:fixed;bottom:0;left:0;..."
```

One line change, no other files affected.

