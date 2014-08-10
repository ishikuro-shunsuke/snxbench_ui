var app = angular.module('App', []);

app.controller('updateCtrl', function( socket) {
  this.op = "";

  socket.on('push_op', function (data) {
    this.op = data;
  })
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:3000');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});


