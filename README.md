
# babel-preset-react-optim
[![package version](https://img.shields.io/npm/v/babel-preset-react-optim.svg?style=flat-square)](https://npmjs.org/package/babel-preset-react-optim)
[![package downloads](https://img.shields.io/npm/dm/babel-preset-react-optim.svg?style=flat-square)](https://npmjs.org/package/babel-preset-react-optim)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/babel-preset-react-optim.svg?style=flat-square)](https://npmjs.org/package/babel-preset-react-optim)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Babel preset for optimizing react code

## Table of Contents

- [About](#about)
- [Plugins](#plugins)
- [Usage](#usage)
- [Options](#options)
- [Compatibility](#compatibility)
- [Install](#install)
- [Development](#development)
- [Contribute](#contribute)
- [License](#License)

## About

This preset is nothing more than a collection of [Babel plugins](https://babeljs.io/docs/en/plugins/) intented to improve the performance of React apps. It is inspired on [babel-react-optimize](https://github.com/jamiebuilds/babel-react-optimize), but customized for my own use cases.

## Plugins

- [@babel/plugin-transform-react-constant-elements](https://babeljs.io/docs/en/babel-plugin-transform-react-constant-elements)
- [@babel/plugin-transform-react-inline-elements](https://babeljs.io/docs/en/babel-plugin-transform-react-inline-elements)
- [babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types)
- [babel-plugin-transform-remove-console](https://babeljs.io/docs/en/babel-plugin-transform-remove-console)

## Usage

In `.babelrc`/`babel.config.js`:

```js
{
 // ...
  "env": {
    "production": {
      "presets": ["babel-preset-react-optim"]
    }
  }
}
```


## Options

All four plugins are enabled by default, in this order:

| Option | Default |
| --- | --- |
| `removeConsole` | `{}` |
| `removePropTypes` | `{ removeImport: true }` |
| `inlineElements` | `{}` |
| `constantElements` | `{}` |

Set an option to `false` to disable that plugin. An options object is passed
straight to the corresponding plugin; it replaces that plugin's default options
rather than being merged with them. For example:

```js
{
  env: {
    production: {
      presets: [['babel-preset-react-optim', {
        removeConsole: { exclude: ['error', 'warn'] },
        removePropTypes: { removeImport: false },
        inlineElements: false
      }]]
    }
  }
}
```

The preset itself does not check `NODE_ENV`. Use Babel's `env.production` block
as above to keep console calls and prop-type diagnostics during development.

## Compatibility

This preset continues to use Babel 7 and CommonJS. It does not compile every JSX
construct by itself; use your usual JSX transform alongside it. The regression
suite uses the classic JSX runtime and React 18. The inline-elements plugin is a
legacy optimization, so verify compatibility with your React version and JSX
runtime before enabling it. This update does not migrate to Babel 8 or change the
preset's default options or plugin ordering.

The inline-elements transform can reorder evaluation of a dynamic `key` relative
to other props. Keep key/prop expressions free of side effects, or set
`inlineElements: false` when their evaluation order matters. As with Babel's
[inline-elements guidance](https://babeljs.io/docs/babel-plugin-transform-react-inline-elements),
only enable these optimizations in production.

Do not use `inlineElements` with React 19: it emits the legacy React element
representation. Disable `inlineElements` and use the JSX transform appropriate
for your React version. The classic-runtime opt-out path has been smoke-tested;
this is not a general React 19 or automatic-runtime compatibility guarantee.

## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com).

```sh
$ npm install babel-preset-react-optim
$ # OR
$ yarn add babel-preset-react-optim
```

## Development

Use Node.js 18 or newer for the test runner and Yarn Classic 1.22.22 for the lockfile:

```sh
yarn install --frozen-lockfile --ignore-scripts
yarn lint
yarn test
```

Linting checks files without modifying them. Tests cover plugin configuration,
production/development transforms, reviewed output fixtures, and actual rendered
JSX behavior. The package ships `index.js` directly, so no build step is needed.
The test-runner requirement is separate from the package's consumer requirements;
no new consumer `engines` restriction is added.

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT
