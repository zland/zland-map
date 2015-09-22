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
 * @filedescription wrapps map and playground and any other top level component
 */

'use strict';

var React = require('react');
var PureRenderMixin = React.addons.PureRenderMixin;
var NavigationMixin = require('react-router').Navigation;
var Playground = require('./Playground');
var GoogleMap = require('./GoogleMap');
var GameStore = require('game/stores/GameStore');
var MapStore = require('map/stores/MapStore');
var PlayerStore = require('player/stores/PlayerStore');
var Promise = require('bluebird');
var Crosshair = require('crosshair/components/Crosshair');
var _ = require('underscore');

// var getStoreValues = require('canvasstores/getStoreValues');
// var stores = require('canvasstores/Stores');

function getStoreValues() {
  return {
    hasStableGps: MapStore.hasStableGps(),
    isNewPlayer: GameStore.isNewPlayer()
  };
}

var CanvasWrapper = React.createClass({

  mixins: [NavigationMixin, PureRenderMixin],

  getInitialState: function() {
    return getStoreValues();
  },

  // shouldComponentUpdate: function(nextProps, nextState) {
  //   if (nextState.player.get('dead')) {
  //     this.transitionTo('/continue');
  //     return true;
  //   }
  //
  //   if (nextState.hasStableGps && nextState.isNewPlayer) {
  //     this.transitionTo('/intro')
  //     return true;
  //   }
  //
  //   if (!nextState.hasStableGps) {
  //     this.transitionTo('/gps')
  //     return true;
  //   }
  //
  //   return false;
  // },

  componentDidMount: function() {
    // stores.forEach((function(store) {
    //   store.addChangeListener(this._onChange);
    // }).bind(this));
    MapStore.addChangeListener(this._onChange);
    GameStore.addChangeListener(this._onChange);
    PlayerStore.addChangeListener(this._onChange);

    if (!this.state.hasStableGps) {
      this.transitionTo('/gps');
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (nextState.hasStableGps && nextState.isNewPlayer) {
      this.transitionTo('/intro');
    }
  },

  componentWillUnmount: function() {
    // stores.forEach((function(store) {
    //   store.removeChangeListener(this._onChange);
    // }).bind(this));
    MapStore.removeChangeListener(this._onChange);
    GameStore.removeChangeListener(this._onChange);
    PlayerStore.removeChangeListener(this._onChange);
  },


  _onChange: function() {
    this.setState(getStoreValues());
  },

  render: function() {
    console.log("--- canvas wrapper render");
    return (
      <div ref="canvasWrapper" className="canvas-wrapper">
        {this.props.children}
        <div className="look-radius hidden"></div>
        <GoogleMap/>
        <Playground/>
        <Crosshair/>
      </div>
    );
  }

});

module.exports = CanvasWrapper;
