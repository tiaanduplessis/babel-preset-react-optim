function Card(props) {
  console.log('render');
  return /*#__PURE__*/React.createElement("section", {
    "data-id": props.id
  }, /*#__PURE__*/React.createElement("b", null, "static"), /*#__PURE__*/React.createElement("span", null, props.name));
}
Card.propTypes = {
  id: validator,
  name: validator
};
module.exports = Card;
