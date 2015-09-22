/*!
 * Copyright 2015 Florian Biewald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @filedescription playground wrapps custom components like spots and all items that need to be moved if the map moves
 */
'use strict';

require('jquery-translate3d');

var React = require('react');
var PureRenderMixin = React.addons.PureRenderMixin;
var mapCalculate = require('core/mapCalculate');
var Point = require('core/components/Point');
var SpotFactory = require('./SpotFactory');
var Player = require('player/components/Player');
var SpotStore = require('generatorSpot/stores/SpotStore');
var MapStore = require('map/stores/MapStore');
var SpotFactories = require('spotfactories/ComponentFactories');
var ZombieStore = require('zombie/stores/ZombieStore');

function getStoreValues() {
  return {
    // see #1075
    spots: SpotStore.getSpots(),
    heading: MapStore.getMapHeading(),
    points: ZombieStore.getPoints()
  };
}

var Playground = React.createClass({

  getInitialState: function() {
    return getStoreValues();
  },

  _onChange: function() {
    this.setState(getStoreValues());
  },

  componentDidMount: function() {
    SpotStore.addChangeListener(this._onChange);
    ZombieStore.addChangeListener(this._onChange);
    MapStore.addChangeListener(this._onChange);
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    $(React.findDOMNode(this.refs.playground)).translate3d({rotate: nextState.heading});
    // only render if components are added or deleted
    return this.state.spots.size !== nextState.spots.size || this.state.points.size !== nextState.points.size;
  },

  componentWillUnmount: function() {
    SpotStore.removeChangeListener(this._onChange);
    ZombieStore.removeChangeListener(this._onChange);
    MapStore.removeChangeListener(this._onChange);
    clearInterval(this.updatePositionId);
  },

  render: function() {
    console.log("--- playground render");
    var style = {
      top: mapCalculate.getTop() + 'px',
      left: mapCalculate.getLeft() + 'px',
      width: mapCalculate.getWidth() + 'px',
      height: mapCalculate.getHeight() + 'px'
    };

    return (
      <div className="playground" ref="playground" style={style}>
        <Player/>
        {this.state.spots.map((function(spot) {
          if (!SpotFactories[spot.get('name')]) {
            throw new Error('No factory for spot name: ' + spot.get('name'));
          }
          return SpotFactories[spot.get('name')].create(spot, "spot" + spot.get('id'));
        }).bind(this)).toArray()}
        {this.state.points.map(function(point) {
          return (
            <Point key={'point' + point.get('zombieId') + point.get('pointId')} point={point}/>
          );
        })}
      </div>
    );
  }

});

module.exports = Playground;
