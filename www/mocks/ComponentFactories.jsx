/**
 * @filedescription This file is usually dynamically build within the zland project.
 * It demonstrates a the usage of spots on the playground.
 */

'use strict';

var React = require('react');
var MapStore = require('map/stores/MapStore');

var MapStore = require('map/stores/MapStore');

var TestSpot = React.createClass({

  getStoreValues: function() {
    return {
      moveDiffX: MapStore.getMoveDiffX(),
      moveDiffY: MapStore.getMoveDiffY(),
      overallMoveDiffX: MapStore.getOverallMoveDiffX(),
      overallMoveDiffY: MapStore.getOverallMoveDiffY()
    };
  },

  getInitialState: function() {
    return this.getStoreValues();
  },

  _onChange: function() {
    this.setState(this.getStoreValues());
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    this.correctMoveDiff(nextState);
    return false;
  },

  componentWillUnmount: function() {
    MapStore.removeChangeListener(this._onChange);
  },

  componentDidMount: function() {
    MapStore.addChangeListener(this._onChange);
    this.$testspot = $(React.findDOMNode(this.refs.testspot));

    if (this.state.overallMoveDiffX !== 0 || this.state.overallMoveDiffY !== 0) {
      this.$testspot.translate3d({
        x: this.state.overallMoveDiffX,
        y: this.state.overallMoveDiffY
      });
    }
  },

  render: function() {
    return (
      <div className="testspot" ref="testspot" style={{left: MapStore.getMapWidth() / 2, top: MapStore.getMapHeight() / 2}}>
        testspot
      </div>
    );
  },

  correctMoveDiff: function(props) {
    if (props.moveDiffX !== 0 || props.moveDiffY !== 0) {
      this.$testspot.translate3d({
        x: props.moveDiffX,
        y: props.moveDiffY
      });
    }
  }
});

module.exports = {
  'testspot': {
    create: function(spot, ref) {
      console.log("create");
      return (
        <TestSpot key='0'/>
      );
    }
  }
};
