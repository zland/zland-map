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

var math = require('core/math');


var VECTOR_POSITION_COUNT = 150;

function PositionRange(startPosition, endPosition, positionConverter, heading) {
  this.startPosition = startPosition;
  this.endPosition = endPosition;
  this.positionConverter = positionConverter;
  this.heading = heading;
}

PositionRange.prototype = {
  calculateVector: function() {
    var angle, coords, radians, positionCount,
        speed, xunits, yunits, vectorPositions;

    if (!this.heading) {
      console.log("no last heading, cannot calculate vector");
      return [];
    }
    angle = -90 + this.heading.magneticHeading;
    radians = angle * (Math.PI / 180);
    speed = this.getCalculatedSpeed();
    xunits = math.toFixed(Math.cos(radians) * speed, 7);
    yunits = math.toFixed(Math.sin(radians) * speed, 7);
    coords = this.positionConverter.getPixels(this.endPosition);

    vectorPositions = [];
    positionCount = 0;

    while (positionCount <= VECTOR_POSITION_COUNT) {
      var latLng;
      coords.x += xunits;
      coords.y += yunits;
      latLng = this.positionConverter.getLatLng(coords);
      vectorPositions.push({
        latitude: latLng.lat(),
        longitude: latLng.lng()
      });
      positionCount += 1;
    }
    return vectorPositions;
  },

  calculateRange: function() {
    var coordsInterval, currentCoords, dist, moves, newGpsPosition,
        speed, units, range;

    speed = 0.000002;
    currentCoords = this.positionConverter.getPixels(this.startPosition);
    newGpsPosition = this.positionConverter.getPixels(this.endPosition);
    dist = math.distance(currentCoords, newGpsPosition, speed);
    units = math.units(math.calculateAngle(currentCoords, newGpsPosition), speed);
    moves = 0;
    range = [];

    while (moves <= dist.moves) {
      var latLng;
      currentCoords.x += units.x;
      currentCoords.y += units.y;
      latLng = this.positionConverter.getLatLng(currentCoords);
      range.push({
        latitude: latLng.lat(),
        longitude: latLng.lng()
      });
      moves++;
    }
    return range;
  },

  getCalculatedSpeed: function() {
    var speed;
    speed = this.endPosition.speed;
    if (isNaN(speed)) {
      log("accurate pos: error", "speed is NaN, using default speed");
      return 0.0000007;
    } else {
      return speed / 2500000;
    }
  }
};


module.exports = PositionRange;
