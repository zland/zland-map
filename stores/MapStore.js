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

var ChangeEventEmitter = require('core/ChangeEventEmitter');
var Promise = require('bluebird');
var assign = require('object-assign');
var Dispatcher = require('core/Dispatcher');
var math = require('core/math');
var Constants = require('map/Constants');
var DebugControlsConstants = require('debugControls/Constants');
var CoreConstants = require('core/Constants');
var PlayerConstants = require('player/Constants');
var PositionRange = require('map/services/PositionRange');
var PositionConverter = require('map/services/PositionConverter');
var DistanceService = require('core/services/DistanceService');
var HeadingRange = require('map/services/HeadingRange');
var Defer = require('core/Defer');
var mapCalculate = require('core/mapCalculate');
var SensorService = require('sensorservice');
var Log = require('core/services/LogService');


var HEADING_CHANGE_THRESHOLD = 10;
var POSITION_UPDATE_INTERVAL = 200;
var MIN_DISTANCE_METERS_FOR_POSITION_CHANGE = 3;
var ACCURACY_ACCEPTANCE_LEVEL = 35;
var DELAY_BETWEEN_POSITION_CHANGE = 3000;

var _map, _projection, _mapDiv, _position = null, _previousPosition,
    _heading = null, _previousHeading = null,
    _mapPosition = null, _positionConverter = null,
    _overlayProjection = null, _mapHeading = null, _mapCenter;

var _lastDiffPosition = null;
var _moveDiffX = 0;
var _moveDiffY = 0;
var _calcMoveDiffX = 0;
var _calcMoveDiffY = 0;
var _overallMoveDiffX = 0;
var _overallMoveDiffY = 0;
var _updatePositionId;
var _hasStableGps = false;
var _lastPositionChangeTimestamp = 0;

var _headingPromise;
var _positionPromise;
var _sensorService = new SensorService(window.navigator);


function isNewPositionChangeAllowed(position) {

  var distance = MIN_DISTANCE_METERS_FOR_POSITION_CHANGE + 10;
  if (_mapPosition) {
    distance = DistanceService.calculateMeters(_mapPosition, position.coords);
  }

  return Date.now() > (_lastPositionChangeTimestamp + DELAY_BETWEEN_POSITION_CHANGE)
         && distance > MIN_DISTANCE_METERS_FOR_POSITION_CHANGE;
}


/**
 * sensor methods
 */

function initGps() {
  _sensorService.initGps(function(position) {
    if (position.coords.accuracy < ACCURACY_ACCEPTANCE_LEVEL && !isNewPositionChangeAllowed(position)) {
      return;
    }
    _hasStableGps = true;
    MapStore.emitChange();
    _lastPositionChangeTimestamp = Date.now();

    _previousPosition = _position;
    _position = position.coords;

    if (_previousPosition && _positionConverter) {
      var positionRange = new PositionRange(
        _mapPosition || _previousPosition,
        _position,
        _positionConverter,
        _heading
      );
      createPositionPromise(positionRange.calculateRange(), positionRange.calculateVector());
    } else {
      _mapPosition = position.coords;
      _position = position.coords;
      MapStore.emitChange();
    }
  });
}

function initCompass() {
  _sensorService.initCompass(function(heading) {
    HeadingRange.setHeading(heading);


    _heading = heading;

    if (_mapHeading === null || _mapHeading === 0) {
      _mapHeading = HeadingRange.getHeading();
      return MapStore.emitChange();
    }

    if (_headingPromise && !_headingPromise.isFulfilled()) {
      return;
    }

    var headingDiff = Math.abs(Math.abs(_mapHeading) - Math.abs(HeadingRange.getContinuousHeading()));

    if (headingDiff < HEADING_CHANGE_THRESHOLD) {
      return;
    }

    createHeadingPromise(HeadingRange.calculateRange());
  });
}


/**
 * position methods
 */

function createPositionPromise(range, vectorRange) {
  if (_positionPromise && !_positionPromise.isFulfilled()) {
    _positionPromise.cancel()
  }

  changePositionByRange(range);

  if (vectorRange.length > 0) {
    _positionPromise.then(changePositionByRange.bind(this, vectorRange))
    ['catch'](Promise.CancellationError, function() {
      // @todo
    });
  }
}

function changePositionByRange(range) {
  var index = 0, position, latLng, defer = Defer();

  _positionPromise = defer.promise;
  _positionPromise.cancellable();

  var intervalId = setInterval(function() {
    if (!range[index]) {
      defer.resolve();
      return clearInterval(intervalId);
    }
    _mapPosition = range[index];
    calculatePositionDiff(MapStore.getMapPositionPixel());
    MapStore.emitChange();
    index++;
  }, 33);

  _positionPromise["catch"](Promise.CancellationError, function(e) {
    // @todo
    clearInterval(intervalId);
  });
}

/**
 * heading methods
 */
 function createHeadingPromise(range) {
   if (_headingPromise && !_headingPromise.isFulfilled()) {
     _headingPromise.cancel()
   }

   changeHeadingByRange(range);
 }

function changeHeadingByRange(range) {
  var index = 0, heading, defer = Defer();

  _headingPromise = defer.promise;
  _headingPromise.cancellable();

  var intervalId = setInterval(function() {
    if (!range[index]) {
      defer.resolve();
      return clearInterval(intervalId);
    }
    _mapHeading = range[index];
    MapStore.emitChange();
    index++;
  }, 10);

  _headingPromise["catch"](Promise.CancellationError, function(e) {
    clearInterval(intervalId);
  });
  _headingPromise["catch"](function(e) {
    Log.debug("[weired] catched unhandled error: " + e);
    Log.debug("[weired] catched unhandled error: " + e.stack);
  });
}



/**
 * position diff methods
 */

function calculatePositionDiff(position) {
  if (!_lastDiffPosition) {
    return _lastDiffPosition = position;
  }
  var dx, dy, p1, p2;
  p1 = position;
  p2 = _lastDiffPosition;
  dx = p2.x - p1.x;
  dy = p2.y - p1.y;
  _calcMoveDiffX += dx;
  _calcMoveDiffY += dy;
  _overallMoveDiffY += dy;
  _overallMoveDiffX += dx;
  _lastDiffPosition = position;
}


function playerHasMoved() {
  return _calcMoveDiffX !== 0 || _calcMoveDiffY !== 0;
}

function startPositionDiffInterval() {
  _updatePositionId = setInterval(function() {
    var element, elements, i, len;
    if (!playerHasMoved()) {
      return;
    }

    _moveDiffX = _calcMoveDiffX;
    _moveDiffY = _calcMoveDiffY;

    MapStore.emitChange();

    _moveDiffX = 0;
    _moveDiffY = 0;
    _calcMoveDiffX = 0;
    _calcMoveDiffY = 0;
  }, POSITION_UPDATE_INTERVAL);
}

var MapStore = assign({}, ChangeEventEmitter, {
  hasStableGps: function() {
    return _hasStableGps;
  },
  getMagneticHeading: function() {
    if (!_heading) {
      return 0;
    }
    return _heading.magneticHeading;
  },
  distanceBetweenCenterAndPosition: function(position) {
    var point = MapStore.getPosition();
    var centerPos = _positionConverter.fromLatLngToDivPixel(
      new google.maps.LatLng(point.latitude, point.longitude)
    );
    return math.distance(position, centerPos).distance;
  },
  getMap: function() {
    return _map;
  },
  // sensors position (longitude, latitude)
  getPosition: function() {
    return _position;
  },
  getPositionPixel: function() {
    if (!_positionConverter || !_position) {
      return null;
    }
    return _positionConverter.getPixels(_position);
  },
  // google map projection
  getProjection: function() {
    return _projection;
  },
  // map position reported by canvas wrapper (lat, long)
  getMapPosition: function() {
    return _mapPosition;
  },
  getMapPositionPixel: function() {
    if (!_positionConverter || !_mapPosition) {
      return null;
    }
    return _positionConverter.fromLatLngObjectToDivPixel(_mapPosition);
  },
  getOverlayProjection: function() {
    return _overlayProjection;
  },
  getPositionConverter: function() {
    return _positionConverter;
  },
  convertPositionToPixel: function(position) {
    if (!_positionConverter) {
      return null;
    }
    return _positionConverter.fromLatLngObjectToDivPixel(position);
  },
  getMapHeading: function() {
    return _mapHeading;
  },
  // the center position reported by google map
  getMapCenter: function() {
    return _mapCenter;
  },
  getMapCenterPixel: function() {
    if (!_mapCenter || !_positionConverter) {
      return null;
    }
    return _positionConverter.fromLatLngToDivPixel(_mapCenter);
  },

  getMoveDiffX: function() {
    return _moveDiffX;
  },
  getMoveDiffY: function() {
    return _moveDiffY;
  },
  getOverallMoveDiffX: function() {
    return _overallMoveDiffX;
  },
  getOverallMoveDiffY: function() {
    return _overallMoveDiffY;
  },
  getMapHeight: function() {
    return mapCalculate.getHeight();
  },
  getMapWidth: function() {
    return mapCalculate.getWidth();
  }
});

MapStore.dispatchToken = Dispatcher.register(function(action) {

  switch (action.type) {

    case CoreConstants.CORE_CONTINUE:
      // _overallMoveDiffX = 0;
      // _overallMoveDiffY = 0;
      _positionPromise = null;
      _headingPromise = null;
      _heading = null;
      _mapHeading = null;
      HeadingRange.reset();
      initGps();
      initCompass();
      MapStore.emitChange();
      break;

    case Constants.MAP_CENTER:
      _mapCenter = action.center;
      break;

    case Constants.MAP_PROJECTION:
      _projection = action.projection;
      _map = action.map;
      if (_overlayProjection && _projection) {
        _positionConverter = new PositionConverter(_projection, _overlayProjection);
      }
      break;

    case Constants.OVERLAY_PROJECTION:
      _overlayProjection = action.projection;
      if (_overlayProjection && _projection) {
        _positionConverter = new PositionConverter(_projection, _overlayProjection);
      }
      break;

    case DebugControlsConstants.DEBUG_HEADING:
      _sensorService.sendHeading(action.heading, MapStore);
      break;
    case DebugControlsConstants.DEBUG_POSITION:
      _sensorService.sendNextPosition(MapStore);
      break;
    case DebugControlsConstants.DEBUG_SEND_POSITION:
      _sensorService.gpsCallback(action.position);
      break;
    case PlayerConstants.PLAYER_DIED:
      _sensorService.clearWatchHeading();
      _sensorService.clearWatchPosition();

      if (_headingPromise && !_headingPromise.isFulfilled()) {
        _headingPromise.cancel()
      }
      if (_positionPromise && !_positionPromise.isFulfilled()) {
        _positionPromise.cancel()
      }

      _hasStableGps = false;
      MapStore.emitChange();
      break;
  }
});

startPositionDiffInterval();
initGps();
initCompass();

module.exports = MapStore;
