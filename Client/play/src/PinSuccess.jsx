'use strict';
/* jshint quotmark: false */

var React = require('react');
var Link = require('react-router').Link;


module.exports = React.createClass({
  render: function () {
    var currentPinIndex = this.props.hunt.currentPinIndex;
    var numOfPins = this.props.hunt.pins.length;
    currentPinIndex = Math.min(currentPinIndex, numOfPins-1);
    var currentPin = this.props.hunt.pins[currentPinIndex];
    var answer = currentPin.answer;
    var resultText = currentPin.resultText;
    var nextClue = null;
    if (!this.props.huntComplete) {
      nextClue = (<button className="btn btn-default"><Link to="clues">Start next location</Link></button>);
    }
    return (
      <div>
        <h1>Success! You're at the correct location</h1>
        <p>{answer}</p>
        <p>{resultText}</p>
        {nextClue}
      </div>
    );
  }
});
