/**
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
require('bootstrap/dist/css/bootstrap.css');
require('map/sass/style');
require('fontawesome/css/font-awesome.min');
/**
 * enable this to see whats happening with playground
 * and google map
 */
// require('core/mapCalculate').getHeight = function() {
//   return 400;
// };
// require('core/mapCalculate').getWidth = function() {
//   return 400;
// };
// require('core/mapCalculate').getTop = function() {
//   return 40;
// };
// require('core/mapCalculate').getLeft = function() {
//   return 40;
// };


var CanvasWrapper = require('map/components/CanvasWrapper');
var React = require('react');
var MapStore = require('map/stores/MapStore');
var DebugControls = require('debugControls/components/debugcontrols');
var DebugActionCreators = require('debugControls/actions/DebugActionCreators');
require('core/Config').set({
  debug: true,
  "debug_coords": {
    "lat": 52.555406,
    "long": 13.418406
  }
});

var Wrapper = React.createClass({
  render: function() {
    return (
      <CanvasWrapper>
        <div className="debug-explanation">
          <ul>
            <li>
              You can move and change heading using left, right and up on your keyboard
            </li>
            <li>
              There is a testspot rendered into playground much like zombies. You can see how its constructed in www/mocks/ComponentFactories
            </li>
          </ul>
        </div>
        <DebugControls/>
      </CanvasWrapper>
    );
  }
});

React.render(
  <Wrapper/>,
  document.getElementById('canvas')
);
