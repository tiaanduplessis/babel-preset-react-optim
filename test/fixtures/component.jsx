function Card (props) {
  console.log('render')
  return <section data-id={props.id}><b>static</b><span>{props.name}</span></section>
}
Card.propTypes = { id: validator, name: validator }
module.exports = Card
