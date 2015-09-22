'use strict';

var assign = require('object-assign');
var ChangeEventEmitter = require('core/ChangeEventEmitter');

module.exports = assign({}, ChangeEventEmitter, {
    isNewPlayer: function() {
      return this.mockData.isNewPlayer;
    },

    mockData: {
      isNewPlayer: false
    }
});
