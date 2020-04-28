const defaultOptions = {
  removeConsole: {},
  removePropTypes: {
    removeImport: true
  },
  inlineElements: {},
  constantElements: {}
}

module.exports = function (_, options = {}) {
  const { removeConsole, removePropTypes, inlineElements, constantElements } = Object.assign({}, defaultOptions, options)

  const plugins = [
    removeConsole && [require('babel-plugin-transform-remove-console'), removeConsole],
    removePropTypes && [require('babel-plugin-transform-react-remove-prop-types'), removePropTypes],
    inlineElements && [require('@babel/plugin-transform-react-inline-elements'), inlineElements],
    constantElements && [require('@babel/plugin-transform-react-constant-elements'), constantElements]
  ].filter(current => !!current)

  return {
    plugins
  }
}
