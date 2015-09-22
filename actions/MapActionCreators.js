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
 * @filedescription action creators mostly forward google map events
 */
'use strict';

var Constants = require('map/Constants');
var Dispatcher = require('core/Dispatcher');

module.exports = {

  /**
   * when goole map is rendered the stores need to get the projection
   * to convert positions from pixels to latlng and vice versa
   * @param  {Object} projection google map projection
   * @param  {Object} map        google map object
   */
  mapProjection: function(projection, map) {
    Dispatcher.dispatch({
      type: Constants.MAP_PROJECTION,
      projection: projection,
      map: map
    });
  },

  /**
   * @deprecated
   */
  overlayProjection: function(projection) {
    Dispatcher.dispatch({
      type: Constants.OVERLAY_PROJECTION,
      projection: projection
    });
  },

  /**
   * whenever the center changes we need to know
   * @param  {Object} center coordinates
   */
  mapCenter: function(center) {
    Dispatcher.dispatch({
      type: Constants.MAP_CENTER,
      center: center
    });
  },
}
