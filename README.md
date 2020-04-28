
# babel-preset-react-optim
[![package version](https://img.shields.io/npm/v/babel-preset-react-optim.svg?style=flat-square)](https://npmjs.org/package/babel-preset-react-optim)
[![package downloads](https://img.shields.io/npm/dm/babel-preset-react-optim.svg?style=flat-square)](https://npmjs.org/package/babel-preset-react-optim)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/babel-preset-react-optim.svg?style=flat-square)](https://npmjs.org/package/babel-preset-react-optim)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Babel preset for optimizing react code

## Table of Contents

- [About](#about)
- [Features](#features)
- [Usage](#usage)
- [Install](#install)
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


## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com).

```sh
$ npm install babel-preset-react-optim
$ # OR
$ yarn add babel-preset-react-optim
```

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT
