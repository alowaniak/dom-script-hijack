# dom-script-hijack

`dom-script-hijack` provides a simple and convenient way to hijack scripts on web pages. This package allows you to intercept and modify the behavior of existing JavaScript code executed within the context of a web page.

## Installation

You can install `dom-script-hijack` using npm:

```bash
npm install dom-script-hijack
```

## Usage

Once installed, you can import the `hijackScript` function from the `dom-script-hijack` package and use it to hijack scripts on web pages. The function takes two parameters: `scriptToHijack` and `transformer`.

The `hijackScript` function sets up a `MutationObserver` to listen for changes in the DOM. When a script matching the provided `scriptToHijack` is added to the page, the `transformer` function is called to modify its content. The original script is then removed, and a new script element with the modified content is inserted in its place.

Here's an example usage:

```javascript
import { hijackScript } from 'dom-script-hijack';

hijackScript(
	/some-script.js/, 
	txt => txt.replace('console.log', 'console.info')
)
```

In the example above, the (first) script with a src matching `some-script.js` will be hijacked. The `transformer` function modifies the script content by replacing all occurrences of `console.log` with `console.info`.
