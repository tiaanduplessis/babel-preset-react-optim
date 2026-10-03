const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const test = require('node:test')
const babel = require('@babel/core')
const jsx = require('@babel/plugin-transform-react-jsx')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const preset = require('..')

const names = ['removeConsole', 'removePropTypes', 'inlineElements', 'constantElements']
const implementations = [
  require('babel-plugin-transform-remove-console'),
  require('babel-plugin-transform-react-remove-prop-types'),
  require('@babel/plugin-transform-react-inline-elements'),
  require('@babel/plugin-transform-react-constant-elements')
]
const disabled = Object.fromEntries(names.map(name => [name, false]))

function transform (code, options = {}, extra = {}) {
  return babel.transformSync(code, {
    babelrc: false,
    configFile: false,
    // Presets run last to first: optimize before lowering the remaining JSX.
    presets: [{ plugins: [[jsx, { runtime: 'classic' }]] }, [preset, options]],
    ...extra
  }).code
}

function fixture (name) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8')
}

function evaluate (code, extra = {}) {
  const context = {
    module: { exports: {} },
    React,
    validator: () => null,
    console: { log () {}, warn () {}, error () {} },
    ...extra
  }
  vm.runInNewContext(code, context)
  return context.module.exports
}

test('CommonJS export and default plugin order/options stay stable', () => {
  assert.equal(typeof preset, 'function')
  const { plugins } = preset()
  assert.deepEqual(plugins.map(([plugin]) => plugin), implementations)
  assert.deepEqual(plugins.map(([, options]) => options), [{}, { removeImport: true }, {}, {}])
})

for (const name of names) {
  test(`${name}: false removes only that plugin`, () => {
    assert.deepEqual(preset(null, { [name]: false }).plugins.map(([plugin]) => plugin),
      implementations.filter((_, index) => names[index] !== name))
  })
}

test('all plugins can be disabled', () => {
  assert.deepEqual(preset(null, disabled), { plugins: [] })
})

test('custom options pass through by identity without merging or mutating them', () => {
  const options = Object.freeze({
    removeConsole: Object.freeze({ exclude: ['error'] }),
    removePropTypes: Object.freeze({ removeImport: false }),
    inlineElements: Object.freeze({}),
    constantElements: Object.freeze({ allowMutablePropsOnTags: ['Box'] })
  })
  preset(null, options).plugins.forEach(([, value], index) => assert.equal(value, options[names[index]]))
  assert.deepEqual(preset().plugins.map(([, value]) => value), [{}, { removeImport: true }, {}, {}])
})

test('production fixture output is stable', () => {
  const output = transform(fixture('component.jsx'), {}, { envName: 'production' })
  assert.equal(output + '\n', fixture('component.production.js'))
  assert.doesNotMatch(output, /console\.log|Card\.propTypes/)
  assert.match(output, /function _jsx/)
})

test('the preset defaults are environment-independent', () => {
  assert.equal(transform(fixture('component.jsx'), {}, { envName: 'development' }),
    transform(fixture('component.jsx'), {}, { envName: 'production' }))
})

test('production-only Babel env configuration leaves development diagnostics intact', () => {
  const options = {
    babelrc: false,
    configFile: false,
    presets: [{ plugins: [[jsx, { runtime: 'classic' }]] }],
    env: { production: { presets: [preset] } }
  }
  const source = fixture('component.jsx')
  const development = babel.transformSync(source, { ...options, envName: 'development' }).code
  const production = babel.transformSync(source, { ...options, envName: 'production' }).code
  assert.match(development, /console\.log/)
  assert.match(development, /Card\.propTypes/)
  assert.match(development, /React\.createElement/)
  assert.doesNotMatch(production, /console\.log|Card\.propTypes/)
  assert.equal(development + '\n', fixture('component.development.js'))
})

test('removePropTypes honors both removeImport values and false', () => {
  const source = "import PropTypes from 'prop-types'; function View () { return <div /> } View.propTypes = { label: PropTypes.string };"
  const removed = transform(source)
  assert.doesNotMatch(removed, /prop-types|View\.propTypes/)
  const retainedImport = transform(source, { removePropTypes: { removeImport: false } })
  assert.match(retainedImport, /import PropTypes from 'prop-types'/)
  assert.doesNotMatch(retainedImport, /View\.propTypes/)
  const disabledOutput = transform(source, { removePropTypes: false })
  assert.match(disabledOutput, /import PropTypes from 'prop-types'/)
  assert.match(disabledOutput, /View\.propTypes/)
})

test('console exclusions and disabling preserve the requested calls', () => {
  const source = "console.log('log'); console.warn('warn'); console.error('error');"
  assert.equal(transform(source), '')
  const excluded = transform(source, { removeConsole: { exclude: ['warn', 'error'] } })
  assert.doesNotMatch(excluded, /console\.log/)
  assert.match(excluded, /console\.warn/)
  assert.match(excluded, /console\.error/)
  const calls = []
  evaluate(transform(source, { removeConsole: false }), {
    console: Object.fromEntries(['log', 'warn', 'error'].map(method => [method, value => calls.push(value)]))
  })
  assert.deepEqual(calls, ['log', 'warn', 'error'])
})

test('constant elements are hoisted only when enabled', () => {
  const source = 'module.exports = function View () { return <div>static</div> }'
  const hoisted = evaluate(transform(source))
  const fresh = evaluate(transform(source, { constantElements: false }))
  assert.equal(hoisted(), hoisted())
  assert.notEqual(fresh(), fresh())
  assert.equal(renderToStaticMarkup(hoisted()), renderToStaticMarkup(fresh()))
})

test('constant-elements custom options affect real hoisting', () => {
  const source = 'function Box (props) { return <div>{props.value.x}</div> } module.exports = function View () { return <Box value={{ x: 1 }} /> }'
  const defaults = evaluate(transform(source, { inlineElements: false }))
  const optedIn = evaluate(transform(source, {
    inlineElements: false,
    constantElements: { allowMutablePropsOnTags: ['Box'] }
  }))
  assert.notEqual(defaults(), defaults())
  assert.equal(optedIn(), optedIn())
  assert.equal(renderToStaticMarkup(defaults()), renderToStaticMarkup(optedIn()))
})

test('inline elements are opt-out and retain the classic JSX render result', () => {
  const source = "module.exports = <div title='hello'>world</div>"
  const inlined = transform(source, { constantElements: false })
  const classic = transform(source, { inlineElements: false, constantElements: false })
  assert.match(inlined, /function _jsx/)
  assert.doesNotMatch(classic, /function _jsx/)
  assert.match(classic, /React\.createElement/)
  assert.equal(renderToStaticMarkup(evaluate(inlined)), '<div title="hello">world</div>')
  assert.equal(renderToStaticMarkup(evaluate(inlined)), renderToStaticMarkup(evaluate(classic)))
})

test('optimized rendering preserves static keys, refs, spreads, defaults and prop evaluation', () => {
  const inputRef = () => {}
  function run (options) {
    const calls = []
    const View = evaluate(transform(fixture('semantics.jsx'), options), {
      record: value => { calls.push(value); return value }
    })
    const element = View({ className: 'card', text: 'content', inputRef, extra: { id: 'extra' } })
    assert.equal(element.props.children[0].key, 'first')
    assert.equal(element.props.children[0].props.label, 'default label')
    assert.equal(element.props.children[1].key, 'second')
    assert.equal(element.props.children[2].ref, inputRef)
    return { html: renderToStaticMarkup(element), calls }
  }
  const optimized = run({})
  assert.deepEqual(optimized, run(disabled))
  assert.deepEqual(optimized.calls, ['card', 'title', 'content'])
  assert.equal(optimized.html, '<main class="card"><strong>default label</strong><span title="title">content</span><input value="value"/><aside id="extra">spread</aside></main>')
})

test('repeated renders keep dynamic and escaped props current', () => {
  const source = fixture('component.jsx')
  const optimized = evaluate(transform(source))
  const original = evaluate(transform(source, disabled))
  for (const props of [{ id: 1, name: '<first>' }, { id: 2, name: 'second & third' }, { id: 0, name: '' }]) {
    assert.equal(renderToStaticMarkup(optimized(props)), renderToStaticMarkup(original(props)))
  }
  assert.equal(renderToStaticMarkup(optimized({ id: 2, name: 'second & third' })),
    '<section data-id="2"><b>static</b><span>second &amp; third</span></section>')
})

test('inlineElements:false preserves side-effect order for a dynamic key', () => {
  const source = "module.exports = <div key={record('key')} title={record('title')} />"
  const calls = []
  const element = evaluate(transform(source, { inlineElements: false }), {
    record: value => { calls.push(value); return value }
  })
  assert.deepEqual(calls, ['key', 'title'])
  assert.equal(element.key, 'key')
  assert.equal(renderToStaticMarkup(element), '<div title="title"></div>')
})
