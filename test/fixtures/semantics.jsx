function Item (props) {
  return <strong>{props.label}</strong>
}
Item.defaultProps = { label: 'default label' }
function View (props) {
  return <main className={record(props.className)}>
    <Item key='first' />
    <span key='second' title={record('title')}>{record(props.text)}</span>
    <input ref={props.inputRef} defaultValue='value' />
    <aside {...props.extra}>spread</aside>
  </main>
}
module.exports = View
