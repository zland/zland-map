'use strict';
var Immutable = require('immutable');
var PlayerStructure = require('core/datastructures/PlayerStructure');
var assign = require('object-assign');
var ChangeEventEmitter = require('core/ChangeEventEmitter');

module.exports = assign({}, ChangeEventEmitter, {
    getPlayer: function() {
      return this.mockData.player;
    },
    mockData: {
      player: Immutable.fromJS(PlayerStructure())
    }
});
