var app = andular.module('App', []);
app.controller('opCtrl', ['$scope', function ($scope) {}]);
$scope.op;
$scope.push_op = function (op) {
  $scope.op = op;
}

