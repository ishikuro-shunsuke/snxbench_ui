var app = angular.module('App', []);
var servername = location.hostname;
var serverroot = 'http://' + servername + ':3000';

app.controller('TopStateController', function($scope) {
  $scope.state = 'programmer';

  $scope.switchState = function(state) {
    $scope.state = state;
  };

  $scope.currentState = function(state) {
    return $scope.state === state;
  };
});

app.controller('ProgrammerController', function($scope, $http, socket) {
  $scope.instruction = {
    line: '',
    array: [],
    asm: '',
    hex: '',
    success: false,
    result: '',
    err: ''
  };

  $scope.programmerState = 's0';

  $scope.opecodes = [
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

  $scope.registers = ['$0', '$1', '$2', '$3'];

  $scope.opClick = function(op_name) {
    this.instruction.line = op_name;

    var rtype_0 = ['ADD', 'AND', 'SLT'];
    var rtype_1 = ['NOR', 'SR'];
    var itype   = ['LD', 'ST', 'LDA', 'AHI', 'BZ', 'BAL'];

    if (rtype_0.indexOf(op_name) != -1) {
      this.instruction.line += ', ';
      $scope.programmerState = 's1';
    } else if (rtype_1.indexOf(op_name) != -1) {
      this.instruction.line += ', ';
      $scope.programmerState = 's5';
    } else if (op_name === 'HLT') {
      this.instruction.line += ';';
      $scope.programmerState = 's14';
    } else if (itpye.indexOf(op_name) != -1) {
      this.instruction.line += ', ';
      $scope.programmerState = 's9';
    }
  };

  $scope.regClick = function(reg_name) {
    this.instruction.line += reg_name;

    switch ($scope.programmerState) {
      case 's1':
        this.instruction.line += ', ';
        $scope.programmerState = 's2';
        break;
      case 's2':
        this.instruction.line += ', ';
        $scope.programmerState = 's3';
        break;
      case 's3':
        this.instruction.line += ';';
        $scope.programmerState = 's14';
        break;
      case 's5':
        this.instruction.line += ', ';
        $scope.programmerState = 's6';
        break;
      case 's6':
        this.instruction.line += ';';
        $scope.programmerState = 's14';
        break;
      case 's9':
        this.instruction.line += ', ';
        $scope.programmerState = 's10';
        break;
      case 's11':
        this.instruction.line += ';';
        $scope.programmerState = 's14';
        break;
    }
  };

  $scope.removeClick = function() {
    $scope.programmerState = 's0';
    this.instruction.line = '';
  };

  $scope.instructionWrite = function() {
    if (!this.instruction.line)
      return;

    this.instruction.asm = this.instruction.asm + this.instruction.line + '\n';
    this.instruction.array.push(this.instrcution.line);
    this.instruction.line = '';
    $scope.programmerState = 's0';
  };

  $scope.asmWrite = function() {
    $http.post('/api/snxasm', {asm: this.instruction.asm}).success(function(data) {
      if ($scope.instruction.success = data.success) {
        $scope.instruction.result = 'Succeeded';
        $scope.instruction.hex = data.hex;
      } else {
        $scope.instruction.result = 'Error';
        $scope.instruction.hex = '';
      } 
    });
  };
});

app.controller('ViewerController', function($scope, socket) {
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
  var socket = io.connect(serverroot);
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


