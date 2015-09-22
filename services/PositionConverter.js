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

'use strict';

var GooglePoint = require('core/google/Point');
var GoogleLatLng = require('core/google/LatLng');

function PositionConverter(projection, overlayProjection) {
  this.projection = projection;
  this.overlayProjection = overlayProjection;
}

PositionConverter.prototype = {

  getLatLng: function(pixels) {
    return this.projection.fromPointToLatLng(new GooglePoint(pixels.x, pixels.y));
  },

  getPixels: function(latLng) {
    return this.getPixelsFromGoogleLatLng(
      new GoogleLatLng(latLng.latitude, latLng.longitude)
    );
  },

  getPixelsFromGoogleLatLng: function(googleLatLng) {
    return this.projection.fromLatLngToPoint(googleLatLng);
  },

  getLatLngDivPixel: function(pixels) {
    return this.overlayProjection.fromDivPixelToLatLng(new GooglePoint(pixels.x, pixels.y));
  },

  fromLatLngToDivPixel: function(latLng) {
    return this.overlayProjection.fromLatLngToDivPixel(latLng);
  },

  fromLatLngObjectToDivPixel: function(latLng) {
    return this.overlayProjection.fromLatLngToDivPixel(new GoogleLatLng(latLng.latitude, latLng.longitude));
  }

}

module.exports = PositionConverter;
