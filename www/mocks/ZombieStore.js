'use strict';

var assign = require('object-assign');
var ChangeEventEmitter = require('core/ChangeEventEmitter');

module.exports = assign({}, ChangeEventEmitter, {
    getPoints: function() {
        return this.mockData.points;
    },

    mockData: {
        points: []
    }
});
