var app = andular.module('App', []);
app.controller('opCtrl', function ($scope, socket) {
  $scope.op = "undefined";
  $scope.push_op = function (op) {
    $scope.op = op;
  };

  socket.on('push_op', function (op) {
    $scope.push_op(op);
  })
});


// using the Angular factory to inject
app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:3001');
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

