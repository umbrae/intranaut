# Intranaut - An instant intranet.

Developing
-------

You must have [Node.js](http://nodejs.org/) installed to build the extension.

1. Install the dependencies: `npm install`
2. Build the extension from `src/js` into `build/js`:
  * Build once: `npm run build`
  * Build continuously as files change: `npm run watch`

The entry point for the extension is `src/js/client.jsx`. The client is written using [React](http://facebook.github.io/react/).

Both these files are bundled using [Browserify](http://browserify.org/) (running a JSX transform for the client scripts) into `build/js`. At runtime, the extension uses only files from `build` and `vendor`.


Thanks
------

Intranaut gratefully uses React architecture inspired by Brandon Tilley's chrome-fast-tab-switcher: https://github.com/BinaryMuse/chrome-fast-tab-switcher which is released under an MIT license. License can be found in docs/
