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
 * @filedescription google map component
 */

'use strict';

require('jquery-translate3d');

var React = require('react');
var MapActionCreators = require('map/actions/MapActionCreators');
var Map = require('core/google/Map');
var Defer = require('core/Defer');
var LatLng = require('core/google/LatLng');
var mapOptions = require('underscore').clone(require('core/google/MapOptions'));
var mapCalc = require('core/mapCalculate');
var googleMaps = require('core/google/Maps');
var MapStore = require('map/stores/MapStore');

function getStoreValues() {
  return {
    'position': MapStore.getMapPosition(),
    'heading': MapStore.getMapHeading()
  };
}


function OverlayView(div, map) {
  this._div = div;
  this.setMap(map);
}

OverlayView.prototype = new googleMaps.OverlayView();

OverlayView.prototype.onAdd = function() {
  var panes = this.getPanes()

  panes.overlayLayer.appendChild(this._div);
};

OverlayView.prototype.draw = function() {
  MapActionCreators.overlayProjection(this.getProjection());
};


var GoogleMap = React.createClass({

  isMapRendered: false,
  googleMap: null,

  getInitialState: function() {
    return getStoreValues();
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextState.position && !this.isMapRendered) {
      this.renderGoogleMap(React.findDOMNode(this.refs.mapCanvas), nextState.position);
      return false;
    }

    if (nextState.position !== this.state.position) {
      this.googleMap.panTo(new LatLng(nextState.position.latitude, nextState.position.longitude));
    }

    if (nextState.heading !== this.state.heading) {
      $(React.findDOMNode(this.refs.mapCanvas)).translate3d({rotate: nextState.heading});
    }
    return false;
  },

  componentDidMount: function() {
    MapStore.addChangeListener(this._onChange);
    if (this.state.position) {
      this.renderGoogleMap(React.findDOMNode(this.refs.mapCanvas), this.state.position);
    }
  },
  componentWillUnmount: function() {
    MapStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var style = {
      // apply sizes to map-canvas div
      height: mapCalc.getHeight() + 'px',
      width: mapCalc.getWidth() + 'px',
      // apply position to map-canvas div
      top: mapCalc.getTop(),
      left: mapCalc.getLeft()
    };
    return <div ref="mapCanvas" className="map-canvas" style={style}/>;
  },

  _onChange: function() {
    this.setState(getStoreValues());
  },

  renderGoogleMap: function(el, position) {
    this.isMapRendered = true;

    mapOptions.center = new LatLng(position.latitude, position.longitude);
    this.googleMap = new Map(el, mapOptions);

    var me = this;

    google.maps.event.addListenerOnce(this.googleMap, "projection_changed", function() {
      MapActionCreators.mapProjection(me.googleMap.getProjection(), me.googleMap);
      MapActionCreators.mapCenter(me.googleMap.getCenter());
      new OverlayView(document.createElement('div'), me.googleMap);
    });

    this.googleMap.addListener('center_changed', function() {
      MapActionCreators.mapCenter(me.googleMap.getCenter());
      // _this.lastCenter = _this.currentCenter;
      // _this.currentCenter = _this.map.getCenter();
      // _this.createPositionInPixel();
      // return Events.fireEvent('map.centerChanged', [_this]);
    });
  }

});


module.exports = GoogleMap;
