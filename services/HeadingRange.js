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
 * @filedescription creates a range steps between current and previous heading
 */

'use strict';

var math = require('core/math');

var _heading = null, _continuousHeading = null, _smoothHeading = null, _diffAddition = 0;

var DIFF_THRESHOLD = 300;

function calculateHeadingRange() {
  var i, j, steps, headingRange = [];

  steps = _continuousHeading < _smoothHeading ? -2 : 2;
  for (i = _smoothHeading; steps > 0 ? i <= _continuousHeading : i >= _continuousHeading; i+= steps) {
    _smoothHeading = _smoothHeading + (steps);
    headingRange.push(_smoothHeading);
  }
  return headingRange;
}

var HeadingRange = {
  /**
   * resets data
   */
  reset: function() {
    _heading = null;
    _continuousHeading = null;
    _smoothHeading = null;
    _diffAddition = 0;
  },
  /**
   * current heading
   * @return {int}
   */
  getHeading: function() {
    return _heading;
  },

  /**
   * set heading obtained by sensor
   * @param  {Object} positioningHeading
   */
  setHeading: function(positioningHeading) {
    var heading = positioningHeading.magneticHeading * -1;

    if (!_heading || _heading === 0) {
      _heading = heading;
      _continuousHeading = heading;
      _smoothHeading = heading;
      return;
    }

    var diff = heading - _heading;
    if (Math.abs(diff) >= DIFF_THRESHOLD) {
      var add = diff > 0 ? -360 : 360;
      _diffAddition+= add;
    }

    _heading = heading
    _continuousHeading = heading + _diffAddition;
  },

  /**
   * continuous heading means normally the sensor range is between 0 and 360.
   * continuous heading continous counting after 360 and below 0.
   *
   * @return {Number}
   */
  getContinuousHeading: function() {
    return _continuousHeading;
  },

  /**
   * the range steps
   * @return {Array}
   */
  calculateRange: function() {
    return calculateHeadingRange();
  }
};


module.exports = HeadingRange;
