var app = angular.module('App', []);
var servername = location.hostname;

app.controller('topStateController', function($scope) {
  $scope.state = 'programmer';

  $scope.switchState = function(state) {
    $scope.state = state;
  };

  $scope.currentState = function(state) {
    return $scope.state === state;
  };
});

app.controller('programmerController', function($scope, socket) {

});

app.controller('viewerController', function($scope, socket) {
  var active = -1;
  $scope.current_op = '';

  socket.on('push_op', function (data) {
    $scope.current_op = data;
    $scope.updateOp($scope.current_op);
  });

  $scope.updateOp = function (op) {
    for (var i = 0; i < $scope.instructions.length; i++) {
      if ($scope.instructions[i].name === op) {
        this.active = i;
      }
    }
  };

  $scope.isActive = function (i) {
    return i === this.active;
  };

  $scope.instructions = [
    { name: 'ADD', sign: '+', desc: 'たし算をする'},
    { name: 'AND', sign: '&', desc: '論理積をとる'},
    { name: 'SLT', sign: '<', desc: '比較する'},
    { name: 'NOT', sign: '^', desc: '否定をとる'},
    { name: 'SR',  sign: '>>', desc: '右シフト'},
    { name: 'HLT', sign: '☠', desc: '終了'},
    { name: 'LD',  sign: '⇓', desc: '読み出し'},
    { name: 'ST',  sign: '⇪', desc: '書き込み'},
    { name: 'LDA', sign: '➸', desc: 'アドレス読み出し'},
    { name: 'AHI', sign: '+', desc: '数を加える'},
    { name: 'BZ',  sign: '⌥', desc: '分岐する'},
    { name: 'BAL', sign: '⌥', desc: '分岐する'},
  ];
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://' + servername + ':3000');
  console.log(socket);
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


