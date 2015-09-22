'use strict';

var assign = require('object-assign');
var ChangeEventEmitter = require('core/ChangeEventEmitter');
var Immutable = require('immutable');
var _ = require('underscore');

var SpotStructure = Immutable.fromJS(
  _.extend(
    require('core/datastructures/SpotStructure')(), {
      name: 'testspot'
    }
  )
);

module.exports = assign({}, ChangeEventEmitter, {
    getSpots: function() {
      return Immutable.List([SpotStructure]);
    }
});
